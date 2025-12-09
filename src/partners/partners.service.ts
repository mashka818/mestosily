import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';

@Injectable()
export class PartnersService {
  constructor(private prisma: PrismaService) {}

  async create(createPartnerDto: CreatePartnerDto) {
    return this.prisma.partner.create({
      data: createPartnerDto,
    });
  }

  async findAll() {
    return this.prisma.partner.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const partner = await this.prisma.partner.findUnique({
      where: { id },
    });

    if (!partner) {
      throw new NotFoundException('Партнер не найден');
    }

    return partner;
  }

  async update(id: string, updatePartnerDto: UpdatePartnerDto) {
    await this.findOne(id);

    return this.prisma.partner.update({
      where: { id },
      data: updatePartnerDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.partner.delete({
      where: { id },
    });
  }
}
