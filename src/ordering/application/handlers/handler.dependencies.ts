import { OrderRepositoryInterface } from "../../domain/repositories/order.repository.interface";
import { DiscountPolicyPort } from "../../domain/services/discount.policy.port";
import { OrderIdGeneratorPort, OrderItemIdGeneratorPort } from "../interfaces/id.generator.interface";
import { OrderFactoryInterface } from "../../domain/factories/order.factory.interface";
import { OrderConfirmationSpecification } from "../../domain/specifications/order.confirmation.specification.interface";

export type CommandHandlerDependencies = {
    repo: OrderRepositoryInterface;
    discountPolicy: DiscountPolicyPort;
    orderIdGenerator: OrderIdGeneratorPort;
    orderItemIdGenerator: OrderItemIdGeneratorPort;
    orderFactory: OrderFactoryInterface;
    orderConfirmationSpecification: OrderConfirmationSpecification;
};
