-- Grant General Operations Admin the same database/RLS authority as Super Admin.
-- This migration is intentionally staged in Git only; do not apply to production until reviewed.
CREATE OR REPLACE FUNCTION private.has_role(required_role user_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = (SELECT auth.uid())
      AND is_active = true
      AND (
        role IN ('super_admin'::user_role, 'operations_admin'::user_role)
        OR role = required_role
      )
  );
$function$;

CREATE OR REPLACE FUNCTION private.has_catalog_access()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = (SELECT auth.uid())
      AND is_active = true
      AND role IN ('super_admin'::user_role, 'catalog_admin'::user_role, 'operations_admin'::user_role)
  );
$function$;

-- These policies use direct profile-role arrays rather than private.has_role().
ALTER POLICY collection_products_delete ON public.collection_products
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
      AND p.is_active
      AND p.role = ANY (ARRAY['super_admin'::user_role, 'catalog_admin'::user_role, 'operations_admin'::user_role])
  )
);

ALTER POLICY collection_products_insert ON public.collection_products
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
      AND p.is_active
      AND p.role = ANY (ARRAY['super_admin'::user_role, 'catalog_admin'::user_role, 'operations_admin'::user_role])
  )
);

ALTER POLICY collection_products_update ON public.collection_products
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
      AND p.is_active
      AND p.role = ANY (ARRAY['super_admin'::user_role, 'catalog_admin'::user_role, 'operations_admin'::user_role])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
      AND p.is_active
      AND p.role = ANY (ARRAY['super_admin'::user_role, 'catalog_admin'::user_role, 'operations_admin'::user_role])
  )
);

ALTER POLICY collection_products_select ON public.collection_products
USING (
  EXISTS (
    SELECT 1
    FROM public.collections c
    JOIN public.products p ON p.id = collection_products.product_id
    WHERE c.id = collection_products.collection_id
      AND c.status = 'published'
      AND p.status = 'published'::product_status
  )
  OR EXISTS (
    SELECT 1 FROM public.profiles pr
    WHERE pr.id = (SELECT auth.uid())
      AND pr.is_active
      AND pr.role = ANY (ARRAY['super_admin'::user_role, 'catalog_admin'::user_role, 'operations_admin'::user_role])
  )
);

ALTER POLICY collections_delete ON public.collections
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
      AND p.is_active
      AND p.role = ANY (ARRAY['super_admin'::user_role, 'catalog_admin'::user_role, 'operations_admin'::user_role])
  )
);

ALTER POLICY collections_insert ON public.collections
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
      AND p.is_active
      AND p.role = ANY (ARRAY['super_admin'::user_role, 'catalog_admin'::user_role, 'operations_admin'::user_role])
  )
);

ALTER POLICY collections_update ON public.collections
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
      AND p.is_active
      AND p.role = ANY (ARRAY['super_admin'::user_role, 'catalog_admin'::user_role, 'operations_admin'::user_role])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
      AND p.is_active
      AND p.role = ANY (ARRAY['super_admin'::user_role, 'catalog_admin'::user_role, 'operations_admin'::user_role])
  )
);

ALTER POLICY collections_select ON public.collections
USING (
  status = 'published'
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
      AND p.is_active
      AND p.role = ANY (ARRAY['super_admin'::user_role, 'catalog_admin'::user_role, 'operations_admin'::user_role])
  )
);

ALTER POLICY inventory_insert ON public.inventory_movements
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
      AND p.is_active
      AND p.role = ANY (ARRAY['super_admin'::user_role, 'catalog_admin'::user_role, 'operations_admin'::user_role])
  )
  AND created_by = (SELECT auth.uid())
);

ALTER POLICY inventory_select ON public.inventory_movements
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
      AND p.is_active
      AND p.role = ANY (ARRAY['super_admin'::user_role, 'catalog_admin'::user_role, 'operations_admin'::user_role])
  )
);
