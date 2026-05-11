import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
                    <Card className="max-w-md w-full">
                        <CardHeader className="text-center">
                            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                            <CardTitle className="text-red-700">Something went wrong</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center space-y-4">
                            <p className="text-gray-600">
                                The application encountered an error. This might be due to missing data or a network issue.
                            </p>
                            
                            {this.state.error && (
                                <div className="text-left bg-gray-100 p-3 rounded text-xs text-gray-700">
                                    <strong>Error:</strong> {this.state.error.message}
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-2">
                                <Button 
                                    onClick={() => window.location.reload()}
                                    className="flex-1"
                                    variant="outline"
                                >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Refresh Page
                                </Button>
                                <Button 
                                    onClick={() => window.location.href = '/'}
                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                >
                                    <Home className="w-4 h-4 mr-2" />
                                    Go Home
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;