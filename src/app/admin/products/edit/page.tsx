import {ProtectedRoute} from '@/components/auth/ProtectedRoute';
import { PERMISSION_IDS } from '@/lib/constants';

export default function EditProductPage() {
  return (
    <ProtectedRoute requiredPermissions={[PERMISSION_IDS.EDIT_PRODUCTS]}>
      <div>
      </div>
    </ProtectedRoute>
  );
}