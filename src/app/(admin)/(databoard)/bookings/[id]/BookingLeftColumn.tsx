"use client";

import { useState } from "react";
import { ENTITY_DATA } from "@/config/entities";
import { updateBooking } from "@/actions/bookings-action";
import { DoubleDatePicker, type DateRange } from "@/src/components/pickers/DoubleDatePicker";
import { formatDate } from "@/getters/date-getter";
import type { BookingModel } from "@/backend/models";

function BookingViewMode({ booking, onEdit }: { booking: BookingModel; onEdit: () => void }) {
    const bookingEntity = ENTITY_DATA.find((e) => e.id === "booking")!;
    const dateStart = formatDate(booking.schema.dateStart);
    const dateEnd = formatDate(booking.schema.dateEnd);

    return (
        <>
            {/* Header */}
            <div>
                <div className="flex items-start gap-6 mb-4">
                    <div className="flex-shrink-0" style={{ color: bookingEntity.color }}>
                        <bookingEntity.icon size={48} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-3xl font-bold text-foreground">{dateStart} - {dateEnd}</h3>
                        <div className="text-xs uppercase tracking-wider text-muted-foreground">
                            Created {formatDate(booking.schema.createdAt)}
                        </div>
                    </div>
                </div>
                <div className="h-1 w-full rounded-full" style={{ backgroundColor: bookingEntity.color }} />
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2">
                <button
                    onClick={onEdit}
                    style={{ borderColor: bookingEntity.color }}
                    className="px-4 py-2 rounded-lg border text-sm font-medium whitespace-nowrap hover:bg-muted/50 transition-colors"
                >
                    Edit
                </button>
            </div>

            {/* Content */}
            <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs text-muted-foreground mb-1">Status</p>
                        <p className="font-medium text-foreground">{booking.schema.status || "Active"}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground mb-1">Referral</p>
                        <p className="font-medium text-foreground">{booking.relations?.studentPackage?.referral?.code || "Nobody"}</p>
                    </div>
                </div>
            </div>
        </>
    );
}

function BookingEditMode({ booking, onCancel, onSubmit }: { booking: BookingModel; onCancel: () => void; onSubmit: (data: any) => Promise<void> }) {
    const bookingEntity = ENTITY_DATA.find((e) => e.id === "booking")!;
    const dateStart = formatDate(booking.schema.dateStart);
    const dateEnd = formatDate(booking.schema.dateEnd);

    const initialFormData = {
        dateStart: booking.schema.dateStart,
        dateEnd: booking.schema.dateEnd,
        status: booking.schema.status,
    };

    const [formData, setFormData] = useState(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialFormData);

    const handleReset = () => {
        setFormData(initialFormData);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await onSubmit(formData);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDateRangeChange = (dateRange: DateRange) => {
        setFormData({ ...formData, dateStart: dateRange.startDate, dateEnd: dateRange.endDate });
    };

    return (
        <>
            {/* Header */}
            <div>
                <div className="flex items-start gap-6 mb-4">
                    <div className="flex-shrink-0" style={{ color: bookingEntity.color }}>
                        <bookingEntity.icon size={48} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-3xl font-bold text-foreground">{dateStart} - {dateEnd}</h3>
                        <div className="text-xs uppercase tracking-wider text-muted-foreground">
                            Created {formatDate(booking.schema.createdAt)}
                        </div>
                    </div>
                </div>
                <div className="h-1 w-full rounded-full" style={{ backgroundColor: bookingEntity.color }} />
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2">
                <button
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted/50 transition-colors disabled:opacity-50 text-sm font-medium whitespace-nowrap"
                >
                    Cancel
                </button>
                <button
                    onClick={handleReset}
                    disabled={!hasChanges || isSubmitting}
                    className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted/50 transition-colors disabled:opacity-50 text-sm font-medium whitespace-nowrap"
                >
                    Reset
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={!hasChanges || isSubmitting}
                    style={{ borderColor: bookingEntity.color }}
                    className="px-4 py-2 rounded-lg border text-sm font-medium whitespace-nowrap transition-colors disabled:opacity-50"
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = `${bookingEntity.color}15`;
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                    }}
                >
                    {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
            </div>

            {/* Form */}
            <div className="space-y-4">
                <DoubleDatePicker
                    dateRange={{ startDate: formData.dateStart, endDate: formData.dateEnd }}
                    onDateRangeChange={handleDateRangeChange}
                    allowPastDates={true}
                    showNavigationButtons={true}
                    showDayCounter={true}
                />

                <div>
                    <label className="text-xs font-medium text-muted-foreground">Status</label>
                    <input
                        type="text"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full h-10 mt-1 px-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="Active"
                    />
                </div>
            </div>
        </>
    );
}

export function BookingLeftColumn({ booking }: { booking: BookingModel }) {
    const [isEditing, setIsEditing] = useState(false);

    const handleSubmit = async (formData: any) => {
        const result = await updateBooking(booking.schema.id, formData);
        if (result.success) {
            setIsEditing(false);
        } else {
            console.error("Error updating booking:", result.error);
        }
    };

    const content = isEditing ? (
        <BookingEditMode booking={booking} onCancel={() => setIsEditing(false)} onSubmit={handleSubmit} />
    ) : (
        <BookingViewMode booking={booking} onEdit={() => setIsEditing(true)} />
    );

    return <div className="space-y-4">{content}</div>;
}
