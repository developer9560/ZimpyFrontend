export interface CheckoutData {
    orderId: number,
    totalAmount: number,
    razorpayOrderId?: string
}

export interface CheckoutResponse {
    data: CheckoutData
    message: string
    status: number
    success: boolean
}
