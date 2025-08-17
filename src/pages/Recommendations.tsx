import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ApiClient, ListingDataDto } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { DataTable } from "@/components/DataTable";
import { useToast } from "@/hooks/use-toast";
import { Star, Package, TrendingUp, X } from "lucide-react";

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState<ListingDataDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [removingProducts, setRemovingProducts] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  const fetchRecommendations = async (page: number) => {
    try {
      setLoading(true);
      const data = await ApiClient.getRecentRecommendations(page, pageSize);
      setRecommendations(data);
    } catch (error) {
      console.error("Failed to fetch recommendations:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load recommendations. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations(currentPage);
  }, [currentPage]);

  const handleRemoveRecommendation = async (productId: number) => {
    setRemovingProducts(prev => new Set(prev).add(productId));
    
    try {
      await ApiClient.updateRecommendationStatus(productId);
      
      // Remove from local state
      setRecommendations(prev => prev.filter(item => item.id !== productId));
      
      toast({
        title: "Success",
        description: "Product removed from recommendations successfully.",
      });
    } catch (error) {
      console.error("Failed to remove recommendation:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove recommendation. Please try again.",
      });
    } finally {
      setRemovingProducts(prev => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  const columns = [
    {
      key: "item_name" as keyof ListingDataDto,
      label: "Product",
      render: (name: string, product: ListingDataDto) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
            {product.urls.length > 0 ? (
              <img 
                src={product.urls[0]} 
                alt={name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "";
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <Package className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
          <div>
            <div className="font-medium">{name}</div>
            <div className="text-sm text-muted-foreground">{product.sub_category}</div>
          </div>
        </div>
      ),
    },
    {
      key: "shop_name" as keyof ListingDataDto,
      label: "Shop",
    },
    {
      key: "category" as keyof ListingDataDto,
      label: "Category",
      render: (category: string) => (
        <StatusBadge status="processing">
          {category.charAt(0).toUpperCase() + category.slice(1)}
        </StatusBadge>
      ),
    },
    {
      key: "final_price" as keyof ListingDataDto,
      label: "Price",
      render: (price: number, product: ListingDataDto) => (
        <div>
          <div className="font-medium">₹{price.toLocaleString()}</div>
          {product.discount !== "0%" && (
            <div className="text-sm text-muted-foreground">
              <span className="line-through">₹{product.actual_price.toLocaleString()}</span>
              <span className="ml-1 text-success">({product.discount} off)</span>
            </div>
          )}
        </div>
      ),
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
    {
      key: "id" as keyof ListingDataDto,
      label: "Actions",
      render: (id: number) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleRemoveRecommendation(id)}
            disabled={removingProducts.has(id)}
            className="flex items-center gap-1 text-destructive hover:text-destructive"
          >
            <X className="h-3 w-3" />
            Remove
          </Button>
        </div>
      ),
    },
  ];

  const totalRecommendations = recommendations.length;
  const activeRecommendations = recommendations.filter(item => item.isActive).length;
  const averagePrice = totalRecommendations > 0 
    ? recommendations.reduce((sum, item) => sum + item.final_price, 0) / totalRecommendations
    : 0;
  const discountedItems = recommendations.filter(item => item.discount !== "0%").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Recommended Products</h1>
        <div className="flex items-center gap-4">
          <Button
            onClick={() => fetchRecommendations(currentPage)}
            disabled={loading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-md">
          <CardHeader className="space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {totalRecommendations}
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md">
          <CardHeader className="space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {activeRecommendations}
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md">
          <CardHeader className="space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Price
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              ₹{Math.round(averagePrice).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md">
          <CardHeader className="space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              With Discounts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {discountedItems}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations Table */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            Recommended Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={recommendations}
            columns={columns}
            searchable={true}
            searchKey="item_name"
            loading={loading}
            pagination={false}
          />
          
          {/* Custom pagination controls */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Page {currentPage + 1}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 0 || loading}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={recommendations.length < pageSize || loading}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}