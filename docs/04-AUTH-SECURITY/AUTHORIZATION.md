# Authorization

Authorization must be checked server-side for every privileged mutation. Customer operations are scoped to the authenticated user. Admin operations require a role/permission check before reaching business services.

Use deny-by-default rules. A missing permission must fail closed. Do not authorize from client-supplied role fields or hidden form values.

Examples: a customer may update their own profile and addresses; an order admin may process orders; a catalog admin may manage products; only authorized roles may assign roles or access audit data.