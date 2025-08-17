import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ApiClient, DeliveryStatus, ListingDataDto } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { DataTable } from "@/components/DataTable";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart3,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  TrendingUp,
  Star,
} from "lucide-react";

export default function Dashboard() {
  const [orders, setOrders] = useState<DeliveryStatus[]>([]);
  const [recommendations, setRecommendations] = useState<ListingDataDto[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        console.log("Fetching dashboard data...");
        
        const [ordersData, recommendationsData] = await Promise.all([
          ApiClient.getOrderStatistics(),
          ApiClient.getRecentRecommendations(0, 5),
        ]);
        
        console.log("Orders data:", ordersData);
        console.log("Recommendations data:", recommendationsData);
        
        setOrders(Array.isArray(ordersData) ? ordersData : []);
        setRecommendations(Array.isArray(recommendationsData) ? recommendationsData : []);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        // Set empty arrays as fallback data
        setOrders([]);
        setRecommendations([]);
        toast({
          variant: "destructive",
          title: "Connection Error", 
          description: "Unable to connect to the server. Showing dashboard with no data.",
        });
      } finally {
        setLoading(false);
        console.log("Dashboard data fetch completed");
      }
    };

    fetchDashboardData();
  }, [toast]);

  // Calculate metrics
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.placed && !o.confirmedd).length;
  const completedOrders = orders.filter(o => o.delivered).length;
  const cancelledOrders = orders.filter(o => o.cancelOrder).length;
  const totalRevenue = orders
    .filter(o => o.delivered && !o.cancelOrder)
    .reduce((sum, order) => sum + order.deliveryFee, 0);

  const statsCards = [
    {
      title: "Total Orders",
      value: totalOrders,
      icon: BarChart3,
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
      title: "Completed Orders",
      value: completedOrders,
      icon: CheckCircle,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Cancelled Orders",
      value: cancelledOrders,
      icon: XCircle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
    {
      title: "Total Revenue",
      value: `₹${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Completion Rate",
      value: totalOrders > 0 ? `${Math.round((completedOrders / totalOrders) * 100)}%` : "0%",
      icon: TrendingUp,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ];

  const orderColumns = [
    {
      key: "orderId" as keyof DeliveryStatus,
      label: "Order ID",
    },
    {
      key: "customerUid" as keyof DeliveryStatus,
      label: "Customer",
    },
    {
      key: "payment_status" as keyof DeliveryStatus,
      label: "Payment Status",
      render: (status: string) => (
        <StatusBadge status={status === "paid" ? "completed" : "pending"}>
          {status}
        </StatusBadge>
      ),
    },
    {
      key: "deliveryFee" as keyof DeliveryStatus,
      label: "Amount",
      render: (fee: number) => `₹${fee.toLocaleString()}`,
    },
    {
      key: "createdAt" as keyof DeliveryStatus,
      label: "Date",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
  ];

  const recommendationColumns = [
    {
      key: "item_name" as keyof ListingDataDto,
      label: "Product",
    },
    {
      key: "shop_name" as keyof ListingDataDto,
      label: "Shop",
    },
    {
      key: "category" as keyof ListingDataDto,
      label: "Category",
    },
    {
      key: "final_price" as keyof ListingDataDto,
      label: "Price",
      render: (price: number) => `₹${price.toLocaleString()}`,
    },
    {
      key: "isActive" as keyof ListingDataDto,
      label: "Status",
      render: (isActive: boolean) => (
        <StatusBadge status={isActive ? "active" : "inactive"}>
          {isActive ? "Active" : "Inactive"}
        </StatusBadge>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
        <div className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

      {/* Recent Orders */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Recent Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={orders.slice(0, 10)}
            columns={orderColumns}
            searchable={true}
            searchKey="orderId"
            pagination={false}
          />
        </CardContent>
      </Card>

      {/* Recent Recommendations */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Recent Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={recommendations}
            columns={recommendationColumns}
            searchable={true}
            searchKey="item_name"
            pagination={false}
          />
        </CardContent>
      </Card>
    </div>
  );
}