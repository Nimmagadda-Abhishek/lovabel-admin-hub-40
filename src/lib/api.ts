const BASE_URL = "https://9be82d00fd52.ngrok-free.app";

const defaultHeaders = {
  "ngrok-skip-browser-warning": "true",
  "Content-Type": "application/json",
};

export class ApiClient {
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Dashboard APIs
  static async getOrderStatistics() {
    return this.request<DeliveryStatus[]>("/api/owner/orders/get");
  }

  static async getRecentRecommendations(page = 0, size = 5) {
    return this.request<ListingDataDto[]>(`/Api/v3/get/recommendation?page=${page}&size=${size}`);
  }

  // Shop Management APIs
  static async getShopsByCategory(category: string) {
    return this.request<OwnerDetails[]>(`/Api/v3/get/shops/${category}`);
  }

  static async updateShopStatus(uid: string, isOpen: boolean) {
    return this.request<{ status: string; message: string }>(
      `/Api/v1/update/shopStatus/${uid}/${isOpen}`,
      { method: "PUT" }
    );
  }

  // Product Management APIs
  static async getProductsByCategory(category: string, page = 0, size = 10) {
    return this.request<ListingDataDto[]>(`/Api/v3/get/posts/data/${category}?page=${page}&size=${size}`);
  }

  static async updateRecommendationStatus(productId: number) {
    return this.request(`/Api/v3/delete/recommend/${productId}`, { method: "PUT" });
  }

  // Order Management APIs
  static async getSubOrderDetails(subOrderId: string) {
    return this.request<SubOrderStatus>(`/api/order_status/get/subOrders/${subOrderId}`);
  }

  // Location APIs
  static async getUserLocation(locationId: number) {
    return this.request<UserLocation>(`/Api/location/idd/${locationId}`);
  }

  // Admin Authentication APIs
  static async sendOtp() {
    return this.request<{ message: string }>("/Api/v1/otp_send", {
      method: "POST",
    });
  }

  static async verifyOtp(email: string, otp: string) {
    return this.request<{ message: string; status: string }>("/Api/v1/otp_verify", {
      method: "POST",
      headers: {
        ...defaultHeaders,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ email, otp }).toString(),
    });
  }

  // Coupon Management APIs
  static async getAllCoupons() {
    return this.request<Coupon[]>("/api/coupons");
  }

  static async createCoupon(couponData: CreateCouponRequest) {
    return this.request<Coupon>("/api/coupons", {
      method: "POST",
      body: JSON.stringify(couponData),
    });
  }

  static async deactivateCoupon(couponId: number) {
    return this.request<Coupon>(`/api/coupons/${couponId}/deactivate`, {
      method: "PATCH",
    });
  }

  static async getCouponUsageHistory(userId: string) {
    return this.request(`/api/coupons/history/${userId}`);
  }
}

// Type definitions based on API responses
export interface DeliveryStatus {
  id: number;
  ownerUid: string;
  orderId: string;
  driverUid?: string;
  customerUid: string;
  payment_status: string;
  placed: boolean;
  confirmedd: boolean;
  processed: boolean;
  shipped: boolean;
  delivered: boolean;
  cancelOrder: boolean;
  deliveryFee: number;
  driver_payment?: string;
  otp: string;
  createdAt: string;
}

export interface OwnerDetails {
  id: number;
  uid: string;
  name: string;
  phone_number: string;
  shop_name: string;
  category: string;
  rating: number;
  likes_count: number;
  is_open: boolean;
  verify: boolean;
  latitude: number;
  longitude: number;
  image_url: string;
  state: string;
  city: string;
}

export interface ListingDataDto {
  id: number;
  uid: string;
  category: string;
  sub_category: string;
  item_name: string;
  units: string;
  actual_price: number;
  discount: string;
  final_price: number;
  shop_name: string;
  description: string;
  isActive: boolean;
  urls: string[];
  latitude: number;
  longitude: number;
}

export interface OrderItem {
  id: number;
  ownerUid: string;
  category: string;
  itemName: string;
  shopName: string;
  price: string;
  discount: string;
  count: number;
  finalPrice: number;
  itemId: string;
  image: string;
}

export interface SubOrderStatus {
  id: number;
  subOrderId: string;
  addressId: number;
  ownerUid: string;
  subOrderCost: number;
  otp: string;
  totalItems: number;
  items: OrderItem[];
}

export interface UserLocation {
  id: number;
  uid: string;
  name: string;
  phone_number: string;
  alternate_number: string;
  state: string;
  city: string;
  pinCode: string;
  street: string;
  landmark: string;
  verify: boolean;
  latitude: number;
  longitude: number;
}

export interface Coupon {
  id: number;
  couponCode: string;
  discountAmount: number;
  active: boolean;
  createdAt: string;
}

export interface CreateCouponRequest {
  couponCode: string;
  discountAmount: number;
}