import { PrismaClient } from '@prisma/client'
import { parse } from 'csv-parse/sync'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

interface CsvRow {
  Handle: string
  Title: string
  'Body (HTML)': string
  Vendor: string
  Status: string
  'Variant Price': string
  'Variant SKU': string
  'Variant Inventory Policy': string
  'Option1 Name': string
  'Option1 Value': string
  'Option2 Name': string
  'Option2 Value': string
  'Image Src': string
  'Variant Compare At Price': string
}

interface ProductData {
  handle: string
  title: string
  description: string
  vendor: string
  status: string
  variants: {
    sku: string | null
    price: number
    compareAtPrice: number | null
    inventoryPolicy: string
    option1Name: string | null
    option1Value: string | null
    option2Name: string | null
    option2Value: string | null
  }[]
  images: { src: string; position: number }[]
}

function parseCsv(filePath: string): CsvRow[] {
  const content = fs.readFileSync(filePath, 'utf-8')
  return parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as CsvRow[]
}

function groupByHandle(rows: CsvRow[]): Map<string, CsvRow[]> {
  const map = new Map<string, CsvRow[]>()
  for (const row of rows) {
    if (!row.Handle) continue
    const existing = map.get(row.Handle) || []
    existing.push(row)
    map.set(row.Handle, existing)
  }
  return map
}

function buildProduct(handle: string, rows: CsvRow[]): ProductData {
  const mainRow = rows[0]
  const images: { src: string; position: number }[] = []
  const variants: ProductData['variants'] = []
  const seenImages = new Set<string>()
  const seenVariants = new Set<string>()

  let position = 0
  for (const row of rows) {
    if (row['Image Src'] && !seenImages.has(row['Image Src'])) {
      seenImages.add(row['Image Src'])
      images.push({ src: row['Image Src'], position: position++ })
    }

    const variantKey = `${row['Variant SKU']}-${row['Option1 Value']}-${row['Option2 Value']}`
    if (row['Variant Price'] && !seenVariants.has(variantKey)) {
      seenVariants.add(variantKey)
      variants.push({
        sku: row['Variant SKU'] || null,
        price: parseFloat(row['Variant Price']) || 0,
        compareAtPrice: row['Variant Compare At Price']
          ? parseFloat(row['Variant Compare At Price'])
          : null,
        inventoryPolicy: row['Variant Inventory Policy'] || 'deny',
        option1Name: row['Option1 Name'] || null,
        option1Value: row['Option1 Value'] || null,
        option2Name: row['Option2 Name'] || null,
        option2Value: row['Option2 Value'] || null,
      })
    }
  }

  return {
    handle,
    title: mainRow.Title,
    description: mainRow['Body (HTML)'] || '',
    vendor: mainRow.Vendor,
    status: mainRow.Status || 'active',
    variants,
    images,
  }
}

async function importProducts(csvFiles: string[]) {
  const allRows: CsvRow[] = []

  for (const file of csvFiles) {
    console.log(`Reading: ${file}`)
    const rows = parseCsv(file)
    allRows.push(...rows)
    console.log(`  → ${rows.length} rows`)
  }

  const grouped = groupByHandle(allRows)
  console.log(`\nTotal products to import: ${grouped.size}`)

  let imported = 0
  let errors = 0

  for (const [handle, rows] of grouped) {
    try {
      const product = buildProduct(handle, rows)

      await prisma.product.upsert({
        where: { handle },
        update: {
          title: product.title,
          description: product.description,
          vendor: product.vendor,
          status: product.status,
          variants: {
            deleteMany: {},
            create: product.variants,
          },
          images: {
            deleteMany: {},
            create: product.images,
          },
        },
        create: {
          handle: product.handle,
          title: product.title,
          description: product.description,
          vendor: product.vendor,
          status: product.status,
          variants: { create: product.variants },
          images: { create: product.images },
        },
      })

      imported++
      if (imported % 10 === 0) console.log(`Imported ${imported}/${grouped.size}`)
    } catch (err) {
      console.error(`Error importing ${handle}:`, err)
      errors++
    }
  }

  console.log(`\nDone! Imported: ${imported}, Errors: ${errors}`)
}

const csvFiles = process.argv.slice(2)
if (csvFiles.length === 0) {
  console.log('Usage: npm run import:products -- file1.csv file2.csv')
  console.log('Example: npm run import:products -- data/saven.csv data/mwc.csv')
  process.exit(1)
}

importProducts(csvFiles.map((f) => path.resolve(f)))
  .catch(console.error)
  .finally(() => prisma.$disconnect())
