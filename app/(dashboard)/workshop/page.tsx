import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Shirt, 
  Calendar, 
  CheckCircle2, 
  Truck, 
  Clock, 
  ArrowRight,
  RotateCcw,
  Package
} from "lucide-react";

// ==========================================
// DUMMY DATA
// ==========================================

const PROCESSING_ITEMS = [
  {
    id: "WS-001",
    tag: "TAG-8821",
    orderId: "ORD-2024-001",
    item: "Men's Suit (3pc)",
    brand: "Raymond",
    service: "Dry Clean + Steam",
    receivedAt: "Today, 10:30 AM",
    status: "cleaning",
    priority: "high"
  },
  {
    id: "WS-002",
    tag: "TAG-8824",
    orderId: "ORD-2024-005",
    item: "Silk Saree (Red)",
    brand: "Kanjivaram",
    service: "Polishing",
    receivedAt: "Yesterday, 4:00 PM",
    status: "polishing",
    priority: "normal"
  },
  {
    id: "WS-003",
    tag: "TAG-8829",
    orderId: "ORD-2024-006",
    item: "Leather Jacket",
    brand: "Zara",
    service: "Specialist Clean",
    receivedAt: "Yesterday, 2:15 PM",
    status: "cleaning",
    priority: "normal"
  },
  {
    id: "WS-008",
    tag: "TAG-8832",
    orderId: "ORD-2024-007",
    item: "Heavy Blanket",
    brand: "Trident",
    service: "Wet Wash",
    receivedAt: "Today, 11:00 AM",
    status: "drying",
    priority: "normal"
  }
];

const READY_ITEMS = [
  {
    id: "WS-004",
    tag: "TAG-8750",
    orderId: "ORD-2024-002",
    item: "Heavy Curtains (x4)",
    brand: "Home Centre",
    service: "Wash & Iron",
    completedAt: "Today, 09:00 AM",
    status: "ready",
  },
  {
    id: "WS-005",
    tag: "TAG-8755",
    orderId: "ORD-2024-003",
    item: "Woolen Coat",
    brand: "Marks & Spencer",
    service: "Dry Clean",
    completedAt: "Today, 08:45 AM",
    status: "ready",
  }
];

const HISTORY_ITEMS = [
  {
    id: "WS-006",
    tag: "TAG-8601",
    orderId: "ORD-2024-001",
    item: "Wedding Sherwani",
    service: "Premium Dry Clean",
    returnedAt: "Jan 15, 2024",
    status: "returned",
  },
  {
    id: "WS-007",
    tag: "TAG-8602",
    orderId: "ORD-2024-001",
    item: "Party Gown",
    service: "Steam Press",
    returnedAt: "Jan 15, 2024",
    status: "returned",
  }
];

// ==========================================
// COMPONENT
// ==========================================

export default function WorkshopPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Workshop Operations
          </h1>
          <p className="text-sm text-slate-500">
            Manage items sent to external processing units
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Stat Card 1 */}
          <div className="group bg-white rounded-2xl p-5 border border-slate-200/60 hover:border-blue-200 transition-all duration-300 hover:shadow-lg hover:shadow-blue-100/50">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">In Processing</p>
                <p className="text-3xl font-bold text-slate-900">{PROCESSING_ITEMS.length}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform">
                <Clock className="w-7 h-7" />
              </div>
            </div>
          </div>

          {/* Stat Card 2 */}
          <div className="group bg-white rounded-2xl p-5 border border-slate-200/60 hover:border-green-200 transition-all duration-300 hover:shadow-lg hover:shadow-green-100/50">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Ready to Return</p>
                <p className="text-3xl font-bold text-slate-900">{READY_ITEMS.length}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-50 to-green-100/50 flex items-center justify-center text-green-600 group-hover:scale-105 transition-transform">
                <CheckCircle2 className="w-7 h-7" />
              </div>
            </div>
          </div>

          {/* Stat Card 3 */}
          <div className="group bg-white rounded-2xl p-5 border border-slate-200/60 hover:border-slate-300 transition-all duration-300 hover:shadow-lg hover:shadow-slate-100/50 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Returned Today</p>
                <p className="text-3xl font-bold text-slate-900">12</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/50 flex items-center justify-center text-slate-600 group-hover:scale-105 transition-transform">
                <Truck className="w-7 h-7" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
          <Tabs defaultValue="processing" className="w-full">
            
            {/* Tabs Header */}
            <div className="border-b border-slate-100 px-6 py-4">
              <TabsList className="bg-slate-50/80 p-1 rounded-xl">
                <TabsTrigger 
                  value="processing" 
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm px-4 py-2 text-sm font-medium transition-all"
                >
                  Processing
                  <Badge className="ml-2 bg-blue-100 text-blue-700 border-0 text-xs px-2">
                    {PROCESSING_ITEMS.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger 
                  value="ready" 
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm px-4 py-2 text-sm font-medium transition-all"
                >
                  Ready
                  <Badge className="ml-2 bg-green-100 text-green-700 border-0 text-xs px-2">
                    {READY_ITEMS.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger 
                  value="history" 
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm px-4 py-2 text-sm font-medium transition-all"
                >
                  History
                </TabsTrigger>
              </TabsList>
            </div>
            
            {/* PROCESSING TAB */}
            <TabsContent value="processing" className="m-0">
              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-slate-50">
                {PROCESSING_ITEMS.map((item) => (
                  <div key={item.id} className="p-5 hover:bg-slate-50/50 transition-colors">
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 flex items-center justify-center text-blue-600 shrink-0">
                          <Package className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-slate-900">{item.item}</h3>
                            {item.priority === 'high' && (
                              <Badge className="bg-red-50 text-red-600 border-red-100 text-xs px-2 shrink-0">
                                Urgent
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-500 mt-1">{item.tag}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
                          {item.service}
                        </Badge>
                        <Badge className="bg-amber-50 text-amber-700 border-amber-100">
                          In Progress
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Clock className="w-4 h-4" />
                        {item.receivedAt}
                      </div>
                      
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white h-10 rounded-xl shadow-sm">
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Mark as Ready
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-100 hover:bg-transparent">
                      <TableHead className="pl-6 font-semibold text-slate-700">Item</TableHead>
                      <TableHead className="font-semibold text-slate-700">Service</TableHead>
                      <TableHead className="font-semibold text-slate-700">Received</TableHead>
                      <TableHead className="font-semibold text-slate-700">Status</TableHead>
                      <TableHead className="pr-6 text-right font-semibold text-slate-700">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {PROCESSING_ITEMS.map((item) => (
                      <TableRow key={item.id} className="border-slate-50 hover:bg-slate-50/50">
                        <TableCell className="pl-6">
                          <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 flex items-center justify-center text-blue-600 shrink-0">
                              <Package className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{item.item}</p>
                              <p className="text-xs text-slate-500 mt-0.5">{item.tag}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 font-normal">
                            {item.service}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Clock className="w-4 h-4 text-slate-400" />
                            {item.receivedAt}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-amber-50 text-amber-700 border-amber-100">
                              In Progress
                            </Badge>
                            {item.priority === 'high' && (
                              <Badge className="bg-red-50 text-red-600 border-red-100 text-xs">
                                Urgent
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="pr-6 text-right">
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm">
                            <CheckCircle2 className="w-4 h-4 mr-1.5" />
                            Mark Ready
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* READY TAB */}
            <TabsContent value="ready" className="m-0">
              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-slate-50">
                {READY_ITEMS.map((item) => (
                  <div key={item.id} className="p-5 hover:bg-slate-50/50 transition-colors">
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-50 to-green-100/50 flex items-center justify-center text-green-600 shrink-0">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900">{item.item}</h3>
                          <p className="text-sm text-slate-500 mt-1">{item.tag}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
                          {item.service}
                        </Badge>
                        <Badge className="bg-green-50 text-green-700 border-green-100">
                          Ready for Dispatch
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-slate-500">Completed: {item.completedAt}</p>
                      
                      <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white h-10 rounded-xl shadow-sm">
                        <Truck className="w-4 h-4 mr-2" />
                        Return to Store
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-100 hover:bg-transparent">
                      <TableHead className="pl-6 font-semibold text-slate-700">Item</TableHead>
                      <TableHead className="font-semibold text-slate-700">Service</TableHead>
                      <TableHead className="font-semibold text-slate-700">Completed</TableHead>
                      <TableHead className="font-semibold text-slate-700">Status</TableHead>
                      <TableHead className="pr-6 text-right font-semibold text-slate-700">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {READY_ITEMS.map((item) => (
                      <TableRow key={item.id} className="border-slate-50 hover:bg-slate-50/50">
                        <TableCell className="pl-6">
                          <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-green-50 to-green-100/50 flex items-center justify-center text-green-600 shrink-0">
                              <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{item.item}</p>
                              <p className="text-xs text-slate-500 mt-0.5">{item.tag}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-600">{item.service}</TableCell>
                        <TableCell className="text-sm text-slate-600">{item.completedAt}</TableCell>
                        <TableCell>
                          <Badge className="bg-green-50 text-green-700 border-green-100">
                            Ready for Dispatch
                          </Badge>
                        </TableCell>
                        <TableCell className="pr-6 text-right">
                          <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-sm">
                            <Truck className="w-4 h-4 mr-1.5" />
                            Return to Store
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* HISTORY TAB */}
            <TabsContent value="history" className="m-0">
              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-slate-50">
                {HISTORY_ITEMS.map((item) => (
                  <div key={item.id} className="p-5 hover:bg-slate-50/50 transition-colors opacity-80">
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                          <RotateCcw className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900">{item.item}</h3>
                          <p className="text-sm text-slate-500 mt-1">{item.tag}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Calendar className="w-4 h-4" />
                        Returned: {item.returnedAt}
                      </div>
                      
                      <Button variant="outline" className="w-full h-10 rounded-xl text-slate-600 border-slate-200">
                        View Details
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-100 hover:bg-transparent">
                      <TableHead className="pl-6 font-semibold text-slate-700">Item</TableHead>
                      <TableHead className="font-semibold text-slate-700">Service</TableHead>
                      <TableHead className="font-semibold text-slate-700">Returned Date</TableHead>
                      <TableHead className="font-semibold text-slate-700">Status</TableHead>
                      <TableHead className="pr-6 text-right font-semibold text-slate-700">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {HISTORY_ITEMS.map((item) => (
                      <TableRow key={item.id} className="border-slate-50 hover:bg-slate-50/50 opacity-75">
                        <TableCell className="pl-6">
                          <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                              <RotateCcw className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{item.item}</p>
                              <p className="text-xs text-slate-500 mt-0.5">{item.tag}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-600">{item.service}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            {item.returnedAt}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-slate-600 border-slate-200">
                            Returned
                          </Badge>
                        </TableCell>
                        <TableCell className="pr-6 text-right">
                          <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-900 rounded-lg">
                            View Details
                            <ArrowRight className="w-4 h-4 ml-1.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}