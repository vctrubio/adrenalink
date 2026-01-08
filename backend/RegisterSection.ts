/**
 * Common registration section patterns for entity creation and selection
 * Used by StudentsSection, PackageSection, TeacherSection
 */

import toast from "react-hot-toast";

interface PostCreationParams {
  pathname: string;
  entityId: string;
  closeDialog: () => void;
  onSelectId: () => void;
  onRefresh: () => Promise<void>;
  onAddToQueue: () => void;
  setFormData: (data: any) => void;
  defaultForm: any;
}

/**
 * Single unified handler for post-creation behavior
 * - On /register (booking form): refresh data, then select in table directly
 * - On /register/entity (dedicated pages): add to queue for later use
 */
export async function handlePostCreation({
  pathname,
  entityId,
  router,
  closeDialog,
  onSelectId,
  onRefresh,
  onAddToQueue,
  setFormData,
  defaultForm,
}: PostCreationParams): Promise<void> {
  if (pathname === "/register") {
    // Booking form: refresh data to fetch new entity, then select in table
    await onRefresh();
    setFormData(defaultForm);
    closeDialog();
    onSelectId();
  } else {
    // Dedicated creation page: add to queue for later use in booking form
    onAddToQueue();
    await onRefresh();
    setFormData(defaultForm);
  }
}

interface CreateEntityHandlerParams {
  isFormValid: boolean;
  entityName: string;
  createFn: () => Promise<{ success: boolean; data?: any; error?: string }>;
  onSuccess: (data: any) => Promise<void>;
  successMessage: string;
  onError?: (error: string) => void;
}

/**
 * Generic entity creation handler with error handling
 * Used by all section components to create entities
 */
export async function handleEntityCreation({
  isFormValid,
  entityName,
  createFn,
  onSuccess,
  successMessage,
  onError,
}: CreateEntityHandlerParams): Promise<{ success: boolean; data?: any }> {
  if (!isFormValid) {
    toast.error("Please fill all required fields");
    return { success: false };
  }

  try {
    const result = await createFn();

    if (!result.success) {
      const error = result.error || `Failed to create ${entityName}`;
      toast.error(error);
      onError?.(error);
      return { success: false };
    }

    // Success toast - AFTER supabase operation completes
    toast.success(successMessage);

    // Call the success handler (handles selection/navigation)
    await onSuccess(result.data);

    return { success: true, data: result.data };
  } catch (error) {
    console.error(`${entityName} creation error:`, error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    toast.error(errorMessage);
    onError?.(errorMessage);
    return { success: false };
  }
}
