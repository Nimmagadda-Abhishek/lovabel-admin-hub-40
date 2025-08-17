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
import { ApiClient, OwnerDetails } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { DataTable } from "@/components/DataTable";
import { useToast } from "@/hooks/use-toast";
import { Store, MapPin, Star, Phone, Verified } from "lucide-react";

const CATEGORIES = [
  "all",
  "electronics",
  "groceries",
  "clothing",
  "food",
  "books",
  "home",
  "sports",
];

export default function ShopManagement() {
  const [shops, setShops] = useState<OwnerDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [updatingShops, setUpdatingShops] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const fetchShops = async (category: string) => {
    try {
      setLoading(true);
      const data = await ApiClient.getShopsByCategory(category);
      setShops(data);
    } catch (error) {
      console.error("Failed to fetch shops:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load shops. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops(selectedCategory);
  }, [selectedCategory]);

  const handleStatusToggle = async (uid: string, currentStatus: boolean) => {
    setUpdatingShops(prev => new Set(prev).add(uid));
    
    try {
      await ApiClient.updateShopStatus(uid, !currentStatus);
      
      // Update local state
      setShops(prevShops =>
        prevShops.map(shop =>
          shop.uid === uid ? { ...shop, is_open: !currentStatus } : shop
        )
      );
      
      toast({
        title: "Success",
        description: `Shop ${!currentStatus ? "opened" : "closed"} successfully.`,
      });
    } catch (error) {
      console.error("Failed to update shop status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update shop status. Please try again.",
      });
    } finally {
      setUpdatingShops(prev => {
        const next = new Set(prev);
        next.delete(uid);
        return next;
      });
    }
  };

  const columns = [
    {
      key: "shop_name" as keyof OwnerDetails,
      label: "Shop Name",
      render: (name: string, shop: OwnerDetails) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Store className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="font-medium">{name}</div>
            <div className="text-sm text-muted-foreground">{shop.name}</div>
          </div>
        </div>
      ),
    },
    {
      key: "category" as keyof OwnerDetails,
      label: "Category",
      render: (category: string) => (
        <StatusBadge status="processing">
          {category.charAt(0).toUpperCase() + category.slice(1)}
        </StatusBadge>
      ),
    },
    {
      key: "phone_number" as keyof OwnerDetails,
      label: "Contact",
      render: (phone: string) => (
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <span>{phone}</span>
        </div>
      ),
    },
    {
      key: "city" as keyof OwnerDetails,
      label: "Location",
      render: (city: string, shop: OwnerDetails) => (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span>{city}, {shop.state}</span>
        </div>
      ),
    },
    {
      key: "rating" as keyof OwnerDetails,
      label: "Rating",
      render: (rating: number, shop: OwnerDetails) => (
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="font-medium">{rating.toFixed(1)}</span>
          <span className="text-sm text-muted-foreground">
            ({shop.likes_count} likes)
          </span>
        </div>
      ),
    },
    {
      key: "verify" as keyof OwnerDetails,
      label: "Verified",
      render: (verified: boolean) => (
        <div className="flex items-center gap-2">
          <Verified className={`h-4 w-4 ${verified ? "text-success" : "text-muted-foreground"}`} />
          <StatusBadge status={verified ? "completed" : "inactive"}>
            {verified ? "Verified" : "Unverified"}
          </StatusBadge>
        </div>
      ),
    },
    {
      key: "is_open" as keyof OwnerDetails,
      label: "Status",
      render: (isOpen: boolean, shop: OwnerDetails) => (
        <div className="flex items-center gap-3">
          <StatusBadge status={isOpen ? "active" : "inactive"}>
            {isOpen ? "Open" : "Closed"}
          </StatusBadge>
          <Switch
            checked={isOpen}
            onCheckedChange={() => handleStatusToggle(shop.uid, isOpen)}
            disabled={updatingShops.has(shop.uid)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Shop Management</h1>
        <div className="flex items-center gap-4">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category === "all" ? "All Categories" : category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={() => fetchShops(selectedCategory)}
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
              Total Shops
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {shops.length}
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md">
          <CardHeader className="space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Open Shops
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {shops.filter(shop => shop.is_open).length}
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md">
          <CardHeader className="space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Verified Shops
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {shops.filter(shop => shop.verify).length}
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md">
          <CardHeader className="space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {shops.length > 0 
                ? (shops.reduce((sum, shop) => sum + shop.rating, 0) / shops.length).toFixed(1)
                : "0.0"
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shops Table */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Shops ({selectedCategory === "all" ? "All Categories" : selectedCategory})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={shops}
            columns={columns}
            searchable={true}
            searchKey="shop_name"
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  );
}