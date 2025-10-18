import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, Min } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({ example: 'user-123', description: 'ID pengguna pemesan' })
  @IsString()
  userId: string;

  @ApiProperty({ example: 'item-987', description: 'ID barang yang dipesan' })
  @IsString()
  itemId: string;

  @ApiProperty({ example: 2, description: 'Jumlah barang yang dipesan' })
  @IsInt()
  @Min(1)
  quantity: number;
}
