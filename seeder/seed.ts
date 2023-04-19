import * as dotenv from 'dotenv'
import { PrismaClient, Product } from '@prisma/client'
import { faker } from '@faker-js/faker'
import { getRandomNumber } from '../src/utils/random-number'

dotenv.config()

const prisma = new PrismaClient()

const createProducts =  async (quantity: number) => {

	const products: Product[] = []

	for (let i = 0; i < quantity; i++) {
		const productName = faker.commerce.productName()
		const categotyName = faker.commerce.department()
		const product  =  await prisma.product.create({
			data: {
				name: productName,
				description: faker.lorem.paragraph(),
				price: +faker.commerce.price(10,999,0),
				slug: faker.helpers.slugify(productName).toLowerCase(),
				images: Array.from({length:getRandomNumber(2,6)}).map(() => faker.image.imageUrl(500,500)),
				category: {
					create: {
						name: categotyName,
						slug: faker.helpers.slugify(categotyName).toLowerCase()
					}
				},
				reviews: {
					create: [
						{
							rating: faker.datatype.number({min: 1, max: 5}),
							text: faker.lorem.paragraph(),
							user: {
								connect: {
									id: 1
								}
							}
						},
						{
							rating: faker.datatype.number({min: 1, max: 5}),
							text: faker.lorem.paragraph(),
							user: {
								connect: {
									id: 1
								}
							}
						},

					]
				}
			}
		})
		products.push(product)
	}

	console.log(`Created ${products.length} products`)

}


async function main() {
	console.log('start seeding')
	await createProducts(10)
}

main()
	.catch(err => console.error(err))
	.finally(async () => {
		await prisma.$disconnect()
	})