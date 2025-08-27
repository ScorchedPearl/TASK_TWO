"use client";
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { X, Plus, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface ProductFormData {
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  images: string[];
  location: {
    city: string;
    state: string;
    zipCode?: string;
  };
  tags: string[];
}

interface ProductFormProps {
  onClose: () => void;
  onSuccess: (product: any) => void;
}

const categories = [
  { value: 'electronics', label: 'Electronics' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'home-garden', label: 'Home & Garden' },
  { value: 'sports', label: 'Sports' },
  { value: 'books', label: 'Books' },
  { value: 'toys', label: 'Toys' },
  { value: 'automotive', label: 'Automotive' },
  { value: 'health-beauty', label: 'Health & Beauty' },
  { value: 'jewelry', label: 'Jewelry' },
  { value: 'collectibles', label: 'Collectibles' },
  { value: 'other', label: 'Other' }
];

const conditions = [
  { value: 'new', label: 'New' },
  { value: 'like-new', label: 'Like New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' }
];

export default function ProductForm({ onClose, onSuccess }: ProductFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm<ProductFormData>();

  const addImageUrl = () => {
    if (newImageUrl.trim() && !imageUrls.includes(newImageUrl.trim())) {
      setImageUrls([...imageUrls, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const removeImageUrl = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim().toLowerCase())) {
      setTags([...tags, newTag.trim().toLowerCase()]);
      setNewTag('');
    }
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ProductFormData) => {
    if (imageUrls.length === 0) {
      setError('root', {
        type: 'manual',
        message: 'At least one image is required'
      });
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('__Pearl_Token');
      
      const productData = {
        ...data,
        price: parseFloat(data.price.toString()),
        images: imageUrls,
        tags: tags,
        location: {
          city: data.location.city.trim(),
          state: data.location.state.trim(),
          zipCode: data.location.zipCode?.trim()
        }
      };

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
      });

      const responseData = await response.json();

      if (response.ok) {
        onSuccess(responseData.data.product);
        onClose();
      } else {
        setError('root', {
          type: 'manual',
          message: responseData.error || 'Failed to create product'
        });
      }
    } catch (error: any) {
      console.error('Product creation error:', error);
      setError('root', {
        type: 'manual',
        message: 'Failed to create product. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4"
      >
        <Card className="bg-white dark:bg-black border border-gray-300 dark:border-emerald-900">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold text-black dark:text-white">
                Add New Product
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
  
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-black dark:text-white">Basic Information</h3>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Product Title *
                  </Label>
                  <Input
                    {...register('title', { 
                      required: 'Title is required',
                      minLength: { value: 3, message: 'Title must be at least 3 characters' }
                    })}
                    className="mt-1 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700"
                    placeholder="Enter product title"
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description *
                  </Label>
                  <textarea
                    {...register('description', { 
                      required: 'Description is required',
                      minLength: { value: 10, message: 'Description must be at least 10 characters' }
                    })}
                    rows={4}
                    className="mt-1 w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md text-black dark:text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    placeholder="Describe your product in detail"
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Price (₹) *
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      {...register('price', { 
                        required: 'Price is required',
                        min: { value: 0.01, message: 'Price must be greater than 0' }
                      })}
                      className="mt-1 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700"
                      placeholder="0.00"
                    />
                    {errors.price && (
                      <p className="text-sm text-red-500 mt-1">{errors.price.message}</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Category *
                    </Label>
                    <select
                      {...register('category', { required: 'Category is required' })}
                      className="mt-1 w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md text-black dark:text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="">Select category</option>
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="text-sm text-red-500 mt-1">{errors.category.message}</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Condition *
                    </Label>
                    <select
                      {...register('condition', { required: 'Condition is required' })}
                      className="mt-1 w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md text-black dark:text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="">Select condition</option>
                      {conditions.map(cond => (
                        <option key={cond.value} value={cond.value}>{cond.label}</option>
                      ))}
                    </select>
                    {errors.condition && (
                      <p className="text-sm text-red-500 mt-1">{errors.condition.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-black dark:text-white">Location</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      City *
                    </Label>
                    <Input
                      {...register('location.city', { required: 'City is required' })}
                      className="mt-1 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700"
                      placeholder="Enter city"
                    />
                    {errors.location?.city && (
                      <p className="text-sm text-red-500 mt-1">{errors.location.city.message}</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      State *
                    </Label>
                    <Input
                      {...register('location.state', { required: 'State is required' })}
                      className="mt-1 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700"
                      placeholder="Enter state"
                    />
                    {errors.location?.state && (
                      <p className="text-sm text-red-500 mt-1">{errors.location.state.message}</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      ZIP Code
                    </Label>
                    <Input
                      {...register('location.zipCode')}
                      className="mt-1 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700"
                      placeholder="Enter ZIP code"
                    />
                  </div>
                </div>
              </div>

              {/* Images */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-black dark:text-white">Product Images</h3>
                
                <div className="flex gap-2">
                  <Input
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700"
                    placeholder="Enter image URL"
                  />
                  <Button type="button" onClick={addImageUrl} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {imageUrls.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {imageUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Product image ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-gray-300 dark:border-gray-700"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImageUrl(index)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>


              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-black dark:text-white">Tags (Optional)</h3>
                
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700"
                    placeholder="Enter tag (e.g., wireless, bluetooth)"
                  />
                  <Button type="button" onClick={addTag} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(index)}
                          className="ml-1 hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {errors.root && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.root.message}</p>
                </div>
              )}

              <div className="flex gap-3 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-white"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Creating...
                    </div>
                  ) : (
                    'Create Product'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}