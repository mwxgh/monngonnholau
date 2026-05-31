import { render } from "@react-email/components";
import {
  OrderCreatedEmail,
  type OrderCreatedEmailProps,
} from "./templates/order-created";
import {
  OrderShippingEmail,
  type OrderShippingEmailProps,
} from "./templates/order-shipping";

export async function renderOrderCreated(
  props: OrderCreatedEmailProps,
): Promise<string> {
  return render(OrderCreatedEmail(props));
}

export async function renderOrderShipping(
  props: OrderShippingEmailProps,
): Promise<string> {
  return render(OrderShippingEmail(props));
}
