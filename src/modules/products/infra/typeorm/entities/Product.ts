import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

import OrdersProducts from '@modules/orders/infra/typeorm/entities/OrdersProducts';

@Entity('products')
class Product {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  name: string;

  @Column('decimal', { precision: 11, scale: 2 })
  price: number;

  @Column('int')
  quantity: number;

  @OneToMany(() => OrdersProducts, orders => orders.product)
  order_products: OrdersProducts[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

export default Product;
