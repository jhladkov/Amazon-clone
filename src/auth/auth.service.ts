import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { AuthDto } from './dtos/auth.dto'
import { faker } from '@faker-js/faker'
import { hash, verify } from 'argon2'
import { JwtService } from '@nestjs/jwt'
import { User } from '@prisma/client'

@Injectable()
export class AuthService {

	constructor(
		private readonly prisma: PrismaService,
		private readonly jwt: JwtService
	) {

	}

	async getNewTokens(refreshToken: string) {
		const result = await this.jwt.verifyAsync(refreshToken)
		if (!result) throw new UnauthorizedException('Invalid refresh token')

		const user = await this.prisma.user.findUnique({
			where: {
				id: result.id
			}
		})
		const tokens = await this.issueTokens(user.id)
		return {
			user: this.returnUserFields(user),
			...tokens
		}

	}

	async login(dto: AuthDto) {
		const user = await this.validateUser(dto)
		const tokens = await this.issueTokens(user.id)
		return {
			user: this.returnUserFields(user),
			...tokens
		}
	}

	async register(dto: AuthDto) {
		const oldUser = await this.prisma.user.findUnique({
			where: {
				email: dto.email
			}
		})
		if (oldUser) throw new BadRequestException('User is already exists')

		const user = await this.prisma.user.create({
			data: {
				email: dto.email,
				name: faker.name.firstName(),
				avatarPath: faker.image.avatar(),
				phone: faker.phone.number('+38 (###) ###-##-##'),
				password: await hash(dto.password)
			}
		})
		const tokens = await this.issueTokens(user.id)
		return {
			user: this.returnUserFields(user),
			...tokens
		}

	}

	private async issueTokens(userId: number) {
		const data = { id: userId }

		const accessToken = this.jwt.sign(data, {
			expiresIn: '1h'
		})
		const refreshToken = this.jwt.sign(data, {
			expiresIn: '7d'
		})
		return { accessToken, refreshToken }
	}

	private returnUserFields(user: User) {
		return {
			id: user.id,
			email: user.email
		}
	}

	private async validateUser(dto: AuthDto) {
		const user = await this.prisma.user.findUnique({
			where: {
				email: dto.email
			}
		})
		if (!user) throw new NotFoundException('User Not Found')

		const isValid = await verify(user.password, dto.password)

		if (!isValid) throw new UnauthorizedException('Invalid Password')
		return user

	}

}
