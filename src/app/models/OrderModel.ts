import { http_get, http_post } from "../services/Api";
import Utils from "../services/Utils";

export class OrderModel {
  static end_point = "orders";
  static table_name = "orders_online_3";

  id: number = 0;
  created_at: string = "";
  updated_at: string = "";
  user: string = "";
  order_state: string = "";
  amount: string = "";
  date_created: string = "";
  payment_confirmation: string = "";
  date_updated: string = "";
  mail: string = "";
  delivery_district: string = "";
  temporary_id: string = "";
  temporary_text: string = "";
  description: string = "";
  customer_name: string = "";
  customer_phone_number_1: string = "";
  customer_phone_number_2: string = "";
  customer_address: string = "";
  order_total: string = "";
  order_details: string = "";
  stripe_id: string = "";
  stripe_text: string = "";
  stripe_url: string = "";
  stripe_paid: string = "";
  
  // Pesapal payment fields
  payment_gateway: string = "";
  payment_status: string = "";
  pesapal_status: string = "";
  pesapal_tracking_id: string = "";

  delivery_method: string = "";
  delivery_address_id: string = "";
  delivery_address_text: string = "";
  delivery_address_details: string = "";
  delivery_amount: string = "";
  payable_amount: string = "";
  items: string = "";

  /**
   * Returns 13% tax as a string, based on the provided value.
   */
  getTax(xx: string): string {
    const value = parseFloat(xx) || 0;
    return (value * 0.13).toString();
  }

  /**
   * Returns true if the order is paid.
   * Checks multiple payment confirmation states including Pesapal and Stripe.
   */
  isPaid(): boolean {
    // Check payment_confirmation for "PAID" status
    if (this.payment_confirmation.toUpperCase() === "PAID") {
      return true;
    }
    
    // Check Pesapal payment status
    if (this.pesapal_status && this.pesapal_status.toUpperCase() === "COMPLETED") {
      return true;
    }
    
    // Check payment_status for successful payments
    if (this.payment_status && this.payment_status.toUpperCase() === "PAID") {
      return true;
    }
    
    // Check Stripe payment status
    if (this.stripe_paid && this.stripe_paid.toUpperCase() === "YES") {
      return true;
    }
    
    // Check for any other positive payment indicators
    const paymentConfirmation = this.payment_confirmation.toUpperCase();
    return paymentConfirmation === "COMPLETED" || 
           paymentConfirmation === "SUCCESS" ||
           paymentConfirmation === "CONFIRMED";
  }

  /**
   * Returns the payment link (Stripe URL).
   */
  getPaymentLink(): string {
    return this.stripe_url;
  }

  /**
   * Returns a human–readable order status.
   */
  getOrderStatus(): string {
    switch (this.order_state) {
      case "0":
        return "Pending";
      case "1":
        return "Processing";
      case "2":
        return "Completed";
      case "3":
        return "Canceled";
      case "4":
        return "Failed";
      default:
        return this.order_state;
    }
  }

  /**
   * Creates an OrderModel instance from a JSON object.
   * @param m A JSON object containing order data.
   */
  static fromJson(m: any): OrderModel {
    const order = new OrderModel();
    if (!m) return order;
    order.id = Utils.int_parse(m["id"]);
    order.created_at = Utils.to_str(m["created_at"], "");
    order.updated_at = Utils.to_str(m["updated_at"], "");
    order.user = Utils.to_str(m["user"], "");
    order.order_state = Utils.to_str(m["order_state"], "");
    order.amount = Utils.to_str(m["amount"], "");
    order.date_created = Utils.to_str(m["date_created"], "");
    order.payment_confirmation = Utils.to_str(m["payment_confirmation"], "");
    order.date_updated = Utils.to_str(m["date_updated"], "");
    order.mail = Utils.to_str(m["mail"], "");
    order.delivery_district = Utils.to_str(m["delivery_district"], "");
    order.temporary_id = Utils.to_str(m["temporary_id"], "");
    order.temporary_text = Utils.to_str(m["temporary_text"], "");
    order.description = Utils.to_str(m["description"], "");
    order.customer_name = Utils.to_str(m["customer_name"], "");
    order.customer_phone_number_1 = Utils.to_str(
      m["customer_phone_number_1"],
      ""
    );
    order.customer_phone_number_2 = Utils.to_str(
      m["customer_phone_number_2"],
      ""
    );
    order.customer_address = Utils.to_str(m["customer_address"], "");
    order.order_total = Utils.to_str(m["order_total"], "");
    order.order_details = Utils.to_str(m["order_details"], "");
    order.stripe_id = Utils.to_str(m["stripe_id"], "");
    order.stripe_text = Utils.to_str(m["stripe_text"], "");
    order.stripe_url = Utils.to_str(m["stripe_url"], "");
    order.stripe_paid = Utils.to_str(m["stripe_paid"], "");
    
    // Pesapal payment fields
    order.payment_gateway = Utils.to_str(m["payment_gateway"], "");
    order.payment_status = Utils.to_str(m["payment_status"], "");
    order.pesapal_status = Utils.to_str(m["pesapal_status"], "");
    order.pesapal_tracking_id = Utils.to_str(m["pesapal_tracking_id"], "");
    
    order.delivery_method = Utils.to_str(m["delivery_method"], "");
    order.delivery_address_id = Utils.to_str(m["delivery_address_id"], "");
    order.delivery_address_text = Utils.to_str(m["delivery_address_text"], "");
    order.delivery_address_details = Utils.to_str(
      m["delivery_address_details"],
      ""
    );
    order.delivery_amount = Utils.to_str(m["delivery_amount"], "");
    order.payable_amount = Utils.to_str(m["payable_amount"], "");
    order.items = Utils.to_str(m["items"], "");
    return order;
  }

  /**
   * Serializes this OrderModel to a plain object.
   */
  toJson(): Record<string, any> {
    return {
      id: this.id,
      created_at: this.created_at,
      updated_at: this.updated_at,
      user: this.user,
      order_state: this.order_state,
      amount: this.amount,
      date_created: this.date_created,
      payment_confirmation: this.payment_confirmation,
      date_updated: this.date_updated,
      mail: this.mail,
      delivery_district: this.delivery_district,
      temporary_id: this.temporary_id,
      temporary_text: this.temporary_text,
      description: this.description,
      customer_name: this.customer_name,
      customer_phone_number_1: this.customer_phone_number_1,
      customer_phone_number_2: this.customer_phone_number_2,
      customer_address: this.customer_address,
      order_total: this.order_total,
      order_details: this.order_details,
      stripe_id: this.stripe_id,
      stripe_text: this.stripe_text,
      stripe_url: this.stripe_url,
      stripe_paid: this.stripe_paid,
      payment_gateway: this.payment_gateway,
      payment_status: this.payment_status,
      pesapal_status: this.pesapal_status,
      pesapal_tracking_id: this.pesapal_tracking_id,
      delivery_method: this.delivery_method,
      delivery_address_id: this.delivery_address_id,
      delivery_address_text: this.delivery_address_text,
      delivery_address_details: this.delivery_address_details,
      delivery_amount: this.delivery_amount,
      payable_amount: this.payable_amount,
      items: this.items,
    };
  }

  /**
   * Fetches orders from the online endpoint.
   * Returns a Promise resolving to an array of OrderModel instances.
   */
  static async fetchItems(): Promise<OrderModel[]> {
    try {
      const response = await http_get(OrderModel.end_point, {});
      if (response.code !== 1) {
        throw new Error(response.message || "Failed to fetch orders.");
      }
      const ordersData = response.data;
      if (!Array.isArray(ordersData)) {
        return [];
      }
      const orders = ordersData.map((orderJson: any) =>
        OrderModel.fromJson(orderJson)
      );
      return orders;
    } catch (error) {
      throw error;
    }
  }
}
