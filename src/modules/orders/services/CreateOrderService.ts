import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,
    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,
    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const customer = await this.customersRepository.findById(customer_id);
    if (!customer) {
      throw new AppError('This customer does not exists.');
    }

    const findedProducts = await this.productsRepository.findAllById(products);

    if (products.length !== findedProducts.length) {
      throw new AppError('One or more products in request does not exists.');
    }

    const productsQuantityUpdated: IProduct[] = [];
    const normalizedProducts = findedProducts.map((product, i) => {
      const requestProduct = products[i];
      const quantity = product.quantity - requestProduct.quantity;

      if (quantity < 0) {
        throw new AppError(
          `Product ${product.name} not have sulficient quantity.`,
        );
      }
      productsQuantityUpdated.push({
        id: product.id,
        quantity,
      });
      return {
        product_id: product.id,
        ...product,
        quantity: requestProduct.quantity,
      };
    });

    const order = await this.ordersRepository.create({
      customer,
      products: normalizedProducts,
    });

    await this.productsRepository.updateQuantity(productsQuantityUpdated);

    return order;
  }
}

export default CreateOrderService;
