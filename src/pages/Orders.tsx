import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ApiClient, DeliveryStatus, SubOrderStatus } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { DataTable } from "@/components/DataTable";
import { useToast } from "@/hooks/use-toast";
import { 
  ShoppingCart, 
  Package, 
  Truck, 
  CheckCircle,
  Clock,
  Eye,
  MapPin,
  Phone
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface EnhancedOrder extends DeliveryStatus {
  subOrderDetails?: SubOrderStatus;
  actualAmount?: number;
  statusText?: string;
}

export default function Orders() {
  const [orders, setOrders] = useState<EnhancedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<EnhancedOrder | null>(null);
  const { toast } = useToast();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const deliveryStatuses: DeliveryStatus[] = await ApiClient.getOrderStatistics();
      
      // Fetch sub-order details for each order to get actual amounts
      const enhancedOrders = await Promise.all(
        deliveryStatuses.map(async (order) => {
          try {
            const subOrderDetails = await ApiClient.getSubOrderDetails(order.orderId);
            return {
              ...order,
              subOrderDetails,
              actualAmount: subOrderDetails?.subOrderCost || 0,
              statusText: getOrderStatusText(order)
            } as EnhancedOrder;
          } catch (error) {
            console.error(`Failed to fetch details for order ${order.orderId}:`, error);
            return {
              ...order,
              actualAmount: 0,
              statusText: getOrderStatusText(order)
            } as EnhancedOrder;
          }
        })
      );
      
      setOrders(enhancedOrders);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load orders. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getOrderStatusText = (order: DeliveryStatus): string => {
    if (order.cancelOrder) return "Cancelled";
    if (order.delivered) return "Delivered";
    if (order.shipped) return "Shipped";
    if (order.processed) return "Processed";
    if (order.confirmedd) return "Confirmed";
    if (order.placed) return "Placed";
    return "Unknown";
  };

  const getOrderStatus = (order: DeliveryStatus) => {
    if (order.cancelOrder) return { status: "cancelled", label: "Cancelled" };
    if (order.delivered) return { status: "completed", label: "Delivered" };
    if (order.shipped) return { status: "processing", label: "Shipped" };
    if (order.processed) return { status: "processing", label: "Processed" };
    if (order.confirmedd) return { status: "processing", label: "Confirmed" };
    if (order.placed) return { status: "pending", label: "Placed" };
    return { status: "inactive", label: "Unknown" };
  };

  const getStatusProgress = (order: DeliveryStatus) => {
    const steps = [
      { key: "placed", label: "Placed", completed: order.placed },
      { key: "confirmedd", label: "Confirmed", completed: order.confirmedd },
      { key: "processed", label: "Processed", completed: order.processed },
      { key: "shipped", label: "Shipped", completed: order.shipped },
      { key: "delivered", label: "Delivered", completed: order.delivered },
    ];
    return steps;
  };

  const columns = [
    {
      key: "orderId" as keyof EnhancedOrder,
      label: "Order ID",
      render: (orderId: string) => (
        <div className="font-mono text-sm">{orderId}</div>
      ),
    },
    {
      key: "customerUid" as keyof EnhancedOrder,
      label: "Customer",
      render: (customerUid: string) => (
        <div className="font-medium truncate max-w-[120px]">{customerUid}</div>
      ),
    },
    {
      key: "payment_status" as keyof EnhancedOrder,
      label: "Payment",
      render: (status: string) => (
        <StatusBadge status={status === "COD" ? "pending" : "completed"}>
          {status}
        </StatusBadge>
      ),
    },
    {
      key: "actualAmount" as keyof EnhancedOrder,
      label: "Amount",
      render: (amount: number, order: EnhancedOrder) => (
        <div className="font-medium">₹{(order.actualAmount || 0).toLocaleString()}</div>
      ),
    },
    {
      key: "createdAt" as keyof EnhancedOrder,
      label: "Date",
      render: (date: string) => (
        <div className="text-sm">
          {new Date(date).toLocaleDateString()}
          <div className="text-muted-foreground text-xs">
            {new Date(date).toLocaleTimeString()}
          </div>
        </div>
      ),
    },
    {
      key: "statusText" as keyof EnhancedOrder,
      label: "Status",
      render: (status: string, order: EnhancedOrder) => {
        const statusObj = getOrderStatus(order);
        return (
          <StatusBadge status={statusObj.status as any}>
            {statusObj.label}
          </StatusBadge>
        );
      },
    },
    {
      key: "orderId" as keyof EnhancedOrder,
      label: "Actions",
      render: (orderId: string, order: EnhancedOrder) => (
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedOrder(order)}
              className="flex items-center gap-1"
            >
              <Eye className="h-3 w-3" />
              View Details
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Order Details - {orderId}</DialogTitle>
            </DialogHeader>
            
            {selectedOrder?.subOrderDetails ? (
              <div className="space-y-6">
                {/* Order Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Order ID</div>
                    <div className="font-mono">{selectedOrder.orderId}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Customer</div>
                    <div className="truncate">{selectedOrder.customerUid}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Payment</div>
                    <Badge variant="outline">{selectedOrder.payment_status}</Badge>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Total Amount</div>
                    <div className="text-lg font-bold">₹{selectedOrder.subOrderDetails.subOrderCost.toLocaleString()}</div>
                  </div>
                </div>

                {/* Order Status Pipeline */}
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-2">Order Progress</div>
                  <div className="flex space-x-2 overflow-x-auto">
                    {getStatusProgress(selectedOrder).map((step, index) => (
                      <div key={index} className="flex items-center min-w-fit">
                        <div className={`w-3 h-3 rounded-full ${
                          step.completed ? 'bg-primary' : 'bg-muted'
                        }`} />
                        <span className={`ml-1 text-xs ${
                          step.completed ? 'text-primary font-medium' : 'text-muted-foreground'
                        }`}>
                          {step.label}
                        </span>
                        {index < getStatusProgress(selectedOrder).length - 1 && (
                          <div className={`w-8 h-px mx-2 ${
                            step.completed ? 'bg-primary' : 'bg-muted'
                          }`} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional Order Info */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">OTP</div>
                    <div className="font-mono font-semibold text-lg">{selectedOrder.otp}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Delivery Fee</div>
                    <div className="font-semibold">₹{selectedOrder.deliveryFee.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Total Items</div>
                    <div className="font-semibold">{selectedOrder.subOrderDetails.totalItems}</div>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="font-medium mb-3">Order Items</h4>
                  <div className="space-y-3">
                    {selectedOrder.subOrderDetails.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                          {item.image ? (
                            <img 
                              src={item.image} 
                              alt={item.itemName}
                              className="w-full h-full object-cover rounded-lg"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <Package className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{item.itemName}</div>
                          <div className="text-sm text-muted-foreground">{item.shopName}</div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">Qty:</span> {item.count} × ₹{item.price}
                            {item.discount !== "0%" && (
                              <span className="text-success ml-2">({item.discount} off)</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">₹{item.finalPrice.toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No order details available
              </div>
            )}
          </DialogContent>
        </Dialog>
      ),
    },
  ];

  // Calculate metrics using actual order amounts
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.placed && !o.confirmedd && !o.cancelOrder).length;
  const shippedOrders = orders.filter(o => o.shipped && !o.delivered && !o.cancelOrder).length;
  const completedOrders = orders.filter(o => o.delivered).length;
  const cancelledOrders = orders.filter(o => o.cancelOrder).length;
  const totalRevenue = orders
    .filter(o => !o.cancelOrder)
    .reduce((sum, order) => sum + (order.actualAmount || 0), 0);
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const statsCards = [
    {
      title: "Total Orders",
      value: totalOrders,
      icon: ShoppingCart,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Pending Orders",
      value: pendingOrders,
      icon: Clock,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      title: "In Transit",
      value: shippedOrders,
      icon: Truck,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Completed",
      value: completedOrders,
      icon: CheckCircle,
      color: "text-success",
      bgColor: "bg-success/10",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Orders Management</h1>
        <div className="flex items-center gap-4">
          <Button onClick={fetchOrders} disabled={loading}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, index) => (
          <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${card.color}`}>
                {card.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue and Cancel Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Revenue</span>
                <span className="font-bold text-success text-xl">₹{totalRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Average Order Value</span>
                <span className="font-medium">
                  ₹{Math.round(averageOrderValue).toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Order Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Completion Rate</span>
                <span className="font-medium">
                  {totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cancelled Orders</span>
                <span className="font-medium text-destructive">{cancelledOrders}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            All Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={orders}
            columns={columns}
            searchable={true}
            searchKey="orderId"
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  );
}