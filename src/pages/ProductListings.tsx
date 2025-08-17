import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApiClient, ListingDataDto } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { DataTable } from "@/components/DataTable";
import { useToast } from "@/hooks/use-toast";
import { Package, Star, Tag, Store, Eye } from "lucide-react";

const CATEGORIES = [
  "electronics",
  "groceries", 
  "clothing",
  "food",
  "books",
  "home",
  "sports",
];

export default function ProductListings() {
  const [products, setProducts] = useState<ListingDataDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("electronics");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [updatingProducts, setUpdatingProducts] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  const fetchProducts = async (category: string, page: number) => {
    try {
      setLoading(true);
      const data = await ApiClient.getProductsByCategory(category, page, pageSize);
      setProducts(data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load products. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(selectedCategory, currentPage);
  }, [selectedCategory, currentPage]);

  const handleRecommendationToggle = async (productId: number) => {
    setUpdatingProducts(prev => new Set(prev).add(productId));
    
    try {
      await ApiClient.updateRecommendationStatus(productId);
      
      toast({
        title: "Success",
        description: "Product recommendation status updated successfully.",
      });
      
      // Refresh the data
      fetchProducts(selectedCategory, currentPage);
    } catch (error) {
      console.error("Failed to update recommendation status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update recommendation status. Please try again.",
      });
    } finally {
      setUpdatingProducts(prev => {
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
      render: (shopName: string) => (
        <div className="flex items-center gap-2">
          <Store className="h-4 w-4 text-muted-foreground" />
          <span>{shopName}</span>
        </div>
      ),
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
      key: "actual_price" as keyof ListingDataDto,
      label: "Price",
      render: (actualPrice: number, product: ListingDataDto) => (
        <div>
          <div className="font-medium">₹{product.final_price.toLocaleString()}</div>
          {product.discount !== "0%" && (
            <div className="text-sm text-muted-foreground">
              <span className="line-through">₹{actualPrice.toLocaleString()}</span>
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
      render: (id: number, product: ListingDataDto) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleRecommendationToggle(id)}
            disabled={updatingProducts.has(id)}
            className="flex items-center gap-1"
          >
            <Star className="h-3 w-3" />
            Recommend
          </Button>
          <Button variant="outline" size="sm">
            <Eye className="h-3 w-3" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Product Listings</h1>
        <div className="flex items-center gap-4">
          <Select value={selectedCategory} onValueChange={(value) => {
            setSelectedCategory(value);
            setCurrentPage(0);
          }}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={() => fetchProducts(selectedCategory, currentPage)}
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
              Total Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {products.length}
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
              {products.filter(product => product.isActive).length}
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
              ₹{products.length > 0 
                ? Math.round(products.reduce((sum, product) => sum + product.final_price, 0) / products.length).toLocaleString()
                : "0"
              }
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md">
          <CardHeader className="space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Discounted Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {products.filter(product => product.discount !== "0%").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Products in {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={products}
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
                disabled={products.length < pageSize || loading}
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