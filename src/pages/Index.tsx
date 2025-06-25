
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const Index = () => {
  const [figmaUrl, setFigmaUrl] = useState("");
  const [pageUrl, setPageUrl] = useState("");
  const [isComparing, setIsComparing] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleCompare = async () => {
    setIsComparing(true);
    // Simulate API call
    setTimeout(() => {
      setIsComparing(false);
      setShowResults(true);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              DesignChecker
            </h1>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              Beta
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
            Compare Figma Designs with Live Pages
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upload your Figma design and compare it pixel-by-pixel with your developed page. 
            Get instant visual diff analysis and match scores.
          </p>
        </div>

        {!showResults ? (
          /* Input Form */
          <Card className="max-w-2xl mx-auto shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-center text-gray-800">Start Comparison</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="figma-url" className="text-sm font-medium text-gray-700">
                  Figma Design URL or Image URL
                </Label>
                <Input
                  id="figma-url"
                  placeholder="https://figma.com/file/... or direct image URL"
                  value={figmaUrl}
                  onChange={(e) => setFigmaUrl(e.target.value)}
                  className="h-12"
                />
                <p className="text-xs text-gray-500">
                  Paste your Figma file URL with node ID or a direct image URL
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="page-url" className="text-sm font-medium text-gray-700">
                  Live Page URL
                </Label>
                <Input
                  id="page-url"
                  placeholder="https://yoursite.com or http://localhost:3000"
                  value={pageUrl}
                  onChange={(e) => setPageUrl(e.target.value)}
                  className="h-12"
                />
                <p className="text-xs text-gray-500">
                  URL of your deployed page or local development server
                </p>
              </div>

              <Button 
                onClick={handleCompare}
                disabled={!figmaUrl || !pageUrl || isComparing}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium"
              >
                {isComparing ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Analyzing...
                  </div>
                ) : (
                  "Compare Design"
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* Results Section */
          <div className="space-y-8">
            {/* Match Score Header */}
            <div className="text-center">
              <div className="inline-flex items-center gap-3 bg-white rounded-2xl px-8 py-4 shadow-lg border">
                <div className="text-3xl font-bold text-green-600">88%</div>
                <div className="text-gray-600">
                  <div className="font-semibold">Match Score</div>
                  <div className="text-sm">Great implementation!</div>
                </div>
              </div>
            </div>

            {/* Comparison Results */}
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Visual Comparison
                  <Button 
                    variant="outline" 
                    onClick={() => setShowResults(false)}
                    className="text-sm"
                  >
                    New Comparison
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="side-by-side" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="side-by-side">Side by Side</TabsTrigger>
                    <TabsTrigger value="overlay">Overlay</TabsTrigger>
                    <TabsTrigger value="differences">Differences</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="side-by-side" className="mt-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h3 className="font-semibold text-gray-800">Figma Design</h3>
                        <div className="aspect-[4/3] bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg border-2 border-dashed border-blue-300 flex items-center justify-center">
                          <div className="text-center text-gray-500">
                            <div className="text-4xl mb-2">🎨</div>
                            <div>Figma Design Preview</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <h3 className="font-semibold text-gray-800">Live Page</h3>
                        <div className="aspect-[4/3] bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg border-2 border-dashed border-green-300 flex items-center justify-center">
                          <div className="text-center text-gray-500">
                            <div className="text-4xl mb-2">💻</div>
                            <div>Screenshot Preview</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="overlay" className="mt-6">
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-800">Overlay Comparison</h3>
                      <div className="aspect-[4/3] bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg border-2 border-dashed border-purple-300 flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <div className="text-4xl mb-2">🔄</div>
                          <div>Overlay View</div>
                          <div className="text-sm mt-1">Toggle between design and code</div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="differences" className="mt-6">
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-800">Visual Differences</h3>
                      <div className="aspect-[4/3] bg-gradient-to-br from-red-100 to-orange-100 rounded-lg border-2 border-dashed border-red-300 flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <div className="text-4xl mb-2">🔍</div>
                          <div>Difference Highlights</div>
                          <div className="text-sm mt-1">Red areas show discrepancies</div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <Separator className="my-6" />

                {/* Analysis Details */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">2</div>
                    <div className="text-sm text-gray-600">Minor Differences</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">98%</div>
                    <div className="text-sm text-gray-600">Layout Accuracy</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">95%</div>
                    <div className="text-sm text-gray-600">Color Accuracy</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Feature Overview */}
        {!showResults && (
          <div className="mt-16 grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📷</span>
              </div>
              <h3 className="font-semibold mb-2">Automated Screenshots</h3>
              <p className="text-gray-600 text-sm">
                Automatically captures screenshots of your live pages using headless browser technology
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="font-semibold mb-2">Pixel-Perfect Analysis</h3>
              <p className="text-gray-600 text-sm">
                Advanced image comparison algorithms detect even the smallest visual differences
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="font-semibold mb-2">Detailed Reports</h3>
              <p className="text-gray-600 text-sm">
                Get comprehensive reports with match scores and highlighted differences
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
