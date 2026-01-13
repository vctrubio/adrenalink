"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import { getCroppedImg } from "@/src/utils/canvasUtils";
import { Slider } from "@/src/components/ui/slider"; // Assuming you have a slider or I'll use a standard input
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/src/components/ui/dialog"; // Assuming standard UI components
import { FormButton } from "@/src/components/ui/form";
import { ZoomIn, ZoomOut, RotateCw } from "lucide-react";

// Fallback if UI components don't exist exactly as imported, I'll check later but this is standard structure
// If Slider doesn't exist, I'll use a native input range.

interface ImageCropperProps {
    imageSrc: string | null;
    aspect: number;
    onCropComplete: (croppedBlob: Blob) => void;
    onCancel: () => void;
    isOpen: boolean;
    title?: string;
    cropShape?: "rect" | "round";
}

export function ImageCropper({ imageSrc, aspect, onCropComplete, onCancel, isOpen, title = "Edit Image", cropShape = "rect" }: ImageCropperProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const onCropChange = (crop: { x: number; y: number }) => {
        setCrop(crop);
    };

    const onZoomChange = (zoom: number) => {
        setZoom(zoom);
    };

    const onRotationChange = (rotation: number) => {
        setRotation(rotation);
    };

    const onCropAreaChange = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleSave = async () => {
        if (!imageSrc || !croppedAreaPixels) return;
        setIsProcessing(true);
        try {
            const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
            if (croppedImage) {
                onCropComplete(croppedImage);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsProcessing(false);
        }
    };

    if (!imageSrc) return null;

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
             <div className="bg-background w-full max-w-2xl mx-4 rounded-xl shadow-2xl overflow-hidden border border-border flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
                    <h3 className="font-semibold text-lg">{title}</h3>
                    <button onClick={onCancel} className="text-muted-foreground hover:text-foreground">✕</button>
                </div>
                
                <div className="relative w-full h-[50vh] bg-black/90">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        rotation={rotation}
                        aspect={aspect}
                        cropShape={cropShape}
                        onCropChange={onCropChange}
                        onCropComplete={onCropAreaChange}
                        onZoomChange={onZoomChange}
                        onRotationChange={onRotationChange}
                        showGrid={true}
                    />
                </div>

                <div className="p-6 space-y-6 bg-background">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <ZoomOut className="w-4 h-4 text-muted-foreground" />
                            <input
                                type="range"
                                value={zoom}
                                min={1}
                                max={3}
                                step={0.1}
                                aria-labelledby="Zoom"
                                onChange={(e) => setZoom(Number(e.target.value))}
                                className="w-full h-1.5 bg-secondary/20 rounded-lg appearance-none cursor-pointer accent-secondary"
                            />
                            <ZoomIn className="w-4 h-4 text-muted-foreground" />
                        </div>
                        
                         <div className="flex items-center gap-4">
                            <RotateCw className="w-4 h-4 text-muted-foreground" />
                            <input
                                type="range"
                                value={rotation}
                                min={0}
                                max={360}
                                step={1}
                                aria-labelledby="Rotation"
                                onChange={(e) => setRotation(Number(e.target.value))}
                                className="w-full h-1.5 bg-secondary/20 rounded-lg appearance-none cursor-pointer accent-secondary"
                            />
                            <span className="text-xs text-muted-foreground w-8 text-right">{rotation}°</span>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isProcessing}
                            className="px-6 py-2 text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-md transition-colors flex items-center gap-2"
                        >
                            {isProcessing ? "Processing..." : "Apply Changes"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
