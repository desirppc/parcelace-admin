
import React from 'react';
import { Search, Bell, Plus, Calculator, CreditCard, Package, Eye, Zap, TrendingUp, Clock, CheckCircle, Truck, MapPin, Home, ShoppingCart, Ship, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-white/20 px-4 py-3">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <h1 className="text-xl font-bold text-transparent bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text">
            ShipFast
          </h1>
          <div className="flex items-center space-x-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                className="pl-10 rounded-xl border-gray-200 bg-white/60 backdrop-blur-sm"
                placeholder="Search orders, tracking..."
              />
            </div>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Quick Actions */}
        <Card className="bg-white/80 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-blue-600" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <Button className="flex-col h-20 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                <CreditCard className="w-6 h-6 mb-1" />
                Add Money
              </Button>
              <Button className="flex-col h-20 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
                <Package className="w-6 h-6 mb-1" />
                Add Order
              </Button>
              <Button className="flex-col h-20 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700">
                <Calculator className="w-6 h-6 mb-1" />
                Calculate Rate
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* KYC Pending */}
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-orange-800 mb-1">Complete Your KYC</h3>
                <p className="text-sm text-orange-600">Start shipping by completing your verification</p>
              </div>
              <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                Complete KYC
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Customize Brand Details */}
        <Card className="bg-white/80 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-gray-900">Customize Brand Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-pink-50 to-blue-50 border border-pink-100">
                <Eye className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <h4 className="font-medium text-gray-900 mb-1">Tracking Page</h4>
                <p className="text-xs text-gray-600 mb-3">Customize your brand experience</p>
                <Button size="sm" variant="outline">Setup</Button>
              </div>
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
                <Package className="w-8 h-8 mx-auto mb-2 text-indigo-600" />
                <h4 className="font-medium text-gray-900 mb-1">Brand Details</h4>
                <p className="text-xs text-gray-600 mb-3">Add logo and company info</p>
                <Button size="sm" variant="outline">Setup</Button>
              </div>
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <h4 className="font-medium text-gray-900 mb-1">Early COD</h4>
                <p className="text-xs text-gray-600 mb-3">Activate cash on delivery</p>
                <Button size="sm" variant="outline">Activate</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Today's Orders</p>
                  <p className="text-2xl font-bold">24</p>
                </div>
                <Package className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Today's Revenue</p>
                  <p className="text-2xl font-bold">₹12,450</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">This Month</p>
                  <p className="text-2xl font-bold">486</p>
                </div>
                <Package className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-500 to-red-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Upcoming COD</p>
                  <p className="text-2xl font-bold">₹45,200</p>
                </div>
                <CreditCard className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Shipment Status */}
        <Card className="bg-white/80 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-gray-900">Shipment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200">
                <Clock className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
                <p className="text-2xl font-bold text-yellow-700">12</p>
                <p className="text-sm text-yellow-600">In Transit</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
                <Truck className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <p className="text-2xl font-bold text-blue-700">8</p>
                <p className="text-sm text-blue-600">Out for Delivery</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <p className="text-2xl font-bold text-green-700">156</p>
                <p className="text-sm text-green-600">Delivered</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="bg-white/80 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-gray-900">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { id: 'TRK001', courier: 'BlueDart', from: 'Mumbai', to: 'Delhi', status: 'In Transit' },
                { id: 'TRK002', courier: 'Delhivery', from: 'Pune', to: 'Bangalore', status: 'Out for Delivery' },
                { id: 'TRK003', courier: 'DTDC', from: 'Chennai', to: 'Hyderabad', status: 'Delivered' },
              ].map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-100">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                      <Truck className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{order.id}</p>
                      <p className="text-sm text-gray-600">{order.courier}</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-1" />
                      {order.from} → {order.to}
                    </div>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs mt-1 ${
                      order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'Out for Delivery' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <Button size="sm" className="bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600">
                    Track
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-white/20 px-4 py-2">
        <div className="flex items-center justify-around max-w-md mx-auto">
          <Button variant="ghost" size="sm" className="flex-col h-12 text-blue-600">
            <Home className="w-5 h-5 mb-1" />
            <span className="text-xs">Home</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex-col h-12 text-gray-600">
            <ShoppingCart className="w-5 h-5 mb-1" />
            <span className="text-xs">Orders</span>
          </Button>
          <Button size="sm" className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 shadow-lg">
            <Plus className="w-6 h-6" />
          </Button>
          <Button variant="ghost" size="sm" className="flex-col h-12 text-gray-600">
            <Ship className="w-5 h-5 mb-1" />
            <span className="text-xs">Shipments</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex-col h-12 text-gray-600">
            <MoreHorizontal className="w-5 h-5 mb-1" />
            <span className="text-xs">More</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
