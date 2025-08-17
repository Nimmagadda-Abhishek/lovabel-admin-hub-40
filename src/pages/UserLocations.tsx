import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiClient, UserLocation } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Search, Phone, User, Verified } from "lucide-react";

export default function UserLocations() {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [locationId, setLocationId] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchLocation = async (id: string) => {
    if (!id.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a location ID.",
      });
      return;
    }

    try {
      setLoading(true);
      const data = await ApiClient.getUserLocation(Number(id));
      setLocation(data);
      toast({
        title: "Success",
        description: "Location loaded successfully.",
      });
    } catch (error) {
      console.error("Failed to fetch location:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load location. Please check the ID and try again.",
      });
      setLocation(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">User Locations</h1>
      </div>

      {/* Search Section */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Location by ID
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Input
              placeholder="Enter location ID..."
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              className="max-w-xs"
              type="number"
            />
            <Button 
              onClick={() => fetchLocation(locationId)}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Location Details */}
      {loading && (
        <Card className="border-0 shadow-md">
          <CardHeader>
            <div className="h-6 bg-muted animate-pulse rounded w-1/3" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-4 bg-muted animate-pulse rounded" />
              <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
              <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
            </div>
          </CardContent>
        </Card>
      )}

      {location && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Information */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                User Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Name</div>
                  <div className="font-medium">{location.name}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">User ID</div>
                  <div className="font-mono text-sm">{location.uid}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Primary Phone</div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{location.phone_number}</span>
                  </div>
                </div>
                {location.alternate_number && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Alternate Phone</div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{location.alternate_number}</span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground">Verification Status</div>
                <div className="flex items-center gap-2 mt-1">
                  <Verified className={`h-4 w-4 ${location.verify ? "text-success" : "text-muted-foreground"}`} />
                  <StatusBadge status={location.verify ? "completed" : "inactive"}>
                    {location.verify ? "Verified" : "Unverified"}
                  </StatusBadge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Address Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">City</div>
                  <div className="font-medium">{location.city}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">State</div>
                  <div className="font-medium">{location.state}</div>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground">PIN Code</div>
                <div className="font-mono">{location.pinCode}</div>
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground">Street Address</div>
                <div>{location.street}</div>
              </div>

              {location.landmark && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Landmark</div>
                  <div>{location.landmark}</div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Latitude</div>
                  <div className="font-mono text-sm">{location.latitude}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Longitude</div>
                  <div className="font-mono text-sm">{location.longitude}</div>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    const url = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
                    window.open(url, "_blank");
                  }}
                  className="w-full"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  View on Google Maps
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {!location && !loading && (
        <Card className="border-0 shadow-md">
          <CardContent className="text-center py-12">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Location Selected</h3>
            <p className="text-muted-foreground">
              Enter a location ID above to view user location details.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}