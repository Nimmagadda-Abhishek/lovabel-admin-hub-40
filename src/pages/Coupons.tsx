import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Filter } from "lucide-react";
import { ApiClient, Coupon, CreateCouponRequest } from "@/lib/api";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { StatusBadge } from "@/components/StatusBadge";

export default function Coupons() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [newCoupon, setNewCoupon] = useState<CreateCouponRequest>({
    couponCode: "",
    discountAmount: 0,
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch coupons
  const {
    data: coupons = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["coupons"],
    queryFn: ApiClient.getAllCoupons,
  });

  // Create coupon mutation
  const createCouponMutation = useMutation({
    mutationFn: ApiClient.createCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      setIsCreateDialogOpen(false);
      setNewCoupon({ couponCode: "", discountAmount: 0 });
      toast({
        title: "Success",
        description: "Coupon created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create coupon",
        variant: "destructive",
      });
    },
  });

  // Deactivate coupon mutation
  const deactivateCouponMutation = useMutation({
    mutationFn: ApiClient.deactivateCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      toast({
        title: "Success",
        description: "Coupon deactivated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to deactivate coupon",
        variant: "destructive",
      });
    },
  });

  // Filter coupons based on status
  const filteredCoupons = coupons.filter((coupon) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "active") return coupon.active;
    if (statusFilter === "inactive") return !coupon.active;
    return true;
  });

  // Calculate statistics
  const activeCoupons = coupons.filter((c) => c.active).length;
  const totalDiscountValue = coupons
    .filter((c) => c.active)
    .reduce((sum, c) => sum + c.discountAmount, 0);

  const handleCreateCoupon = () => {
    if (!newCoupon.couponCode.trim()) {
      toast({
        title: "Validation Error",
        description: "Coupon code is required",
        variant: "destructive",
      });
      return;
    }

    if (newCoupon.discountAmount <= 0) {
      toast({
        title: "Validation Error",
        description: "Discount amount must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    createCouponMutation.mutate(newCoupon);
  };

  const handleDeactivateCoupon = (couponId: number) => {
    deactivateCouponMutation.mutate(couponId);
  };

  const columns = [
    {
      key: "couponCode" as keyof Coupon,
      label: "Coupon Code",
      render: (value: string) => (
        <div className="font-mono font-medium text-primary">{value}</div>
      ),
    },
    {
      key: "discountAmount" as keyof Coupon,
      label: "Discount Amount",
      render: (value: number) => (
        <div className="font-semibold">₹{value.toFixed(2)}</div>
      ),
    },
    {
      key: "active" as keyof Coupon,
      label: "Status",
      render: (value: boolean) => (
        <Badge variant={value ? "default" : "secondary"} className={value ? "bg-green-600" : ""}>
          {value ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "createdAt" as keyof Coupon,
      label: "Created Date",
      render: (value: string) => (
        <div>{new Date(value).toLocaleDateString()}</div>
      ),
    },
    {
      key: "id" as keyof Coupon,
      label: "Actions",
      render: (value: number, coupon: Coupon) => (
        <div className="flex gap-2">
          {coupon.active && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDeactivateCoupon(value)}
              disabled={deactivateCouponMutation.isPending}
            >
              Deactivate
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <p className="text-destructive">Failed to load coupons</p>
          <Button
            onClick={() => queryClient.invalidateQueries({ queryKey: ["coupons"] })}
            className="mt-4"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Coupon Management</h1>
          <p className="text-muted-foreground">
            Create and manage discount coupons for your customers
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Coupon
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle id="dialog-title">Create New Coupon</DialogTitle>
              <DialogDescription id="dialog-description">
                Add a new discount coupon for your customers to use during checkout.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="couponCode">Coupon Code</Label>
                <Input
                  id="couponCode"
                  value={newCoupon.couponCode}
                  onChange={(e) =>
                    setNewCoupon({ ...newCoupon, couponCode: e.target.value.toUpperCase() })
                  }
                  placeholder="Enter coupon code (e.g., SAVE100)"
                  className="font-mono"
                />
              </div>
              <div>
                <Label htmlFor="discountAmount">Discount Amount (₹)</Label>
                <Input
                  id="discountAmount"
                  type="number"
                  value={newCoupon.discountAmount || ""}
                  onChange={(e) =>
                    setNewCoupon({
                      ...newCoupon,
                      discountAmount: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="Enter discount amount"
                  min="1"
                  step="0.01"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleCreateCoupon}
                  disabled={createCouponMutation.isPending}
                  className="flex-1"
                >
                  {createCouponMutation.isPending ? "Creating..." : "Create Coupon"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Coupons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCoupons}</div>
            <p className="text-xs text-muted-foreground">
              Out of {coupons.length} total coupons
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Discount Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalDiscountValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Available for customers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Discount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{activeCoupons > 0 ? (totalDiscountValue / activeCoupons).toFixed(2) : "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">
              Per active coupon
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Data Table */}
      <Card>
        <CardContent className="p-6">
          <DataTable
            data={filteredCoupons}
            columns={columns}
            searchable={true}
            searchKey="couponCode"
            loading={isLoading}
            pagination={true}
            pageSize={10}
          />
        </CardContent>
      </Card>
    </div>
  );
}