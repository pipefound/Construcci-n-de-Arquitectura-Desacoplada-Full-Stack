from rest_framework import viewsets, filters, status
from rest_framework.response import Response
from .models import Categoria, Proveedor, Producto
from .serializers import CategoriaSerializer, ProveedorSerializer, ProductoSerializer

# --- CONTROLADOR CATEGORÍAS ---
class CategoriaViewSet(viewsets.ModelViewSet):
    """
    Controlador RESTful para Categorías:
    - GET /api/categorias/        -> 200 OK (Listar todas)
    - POST /api/categorias/       -> 201 Created (Crear nueva)
    - GET /api/categorias/{id}/   -> 200 OK (Detalle por ID)
    - PUT/PATCH /api/categorias/{id}/ -> 200 OK (Actualizar)
    - DELETE /api/categorias/{id}/ -> 204 No Content (Eliminar)
    """
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['nombre']


# --- CONTROLADOR PROVEEDORES ---
class ProveedorViewSet(viewsets.ModelViewSet):
    """
    Controlador RESTful para Proveedores:
    Implementa operaciones CRUD completas y búsqueda por nombre o contacto.
    """
    queryset = Proveedor.objects.all()
    serializer_class = ProveedorSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['nombre', 'contacto', 'email']


# --- CONTROLADOR PRODUCTOS ---
class ProductoViewSet(viewsets.ModelViewSet):
    """
    Controlador RESTful principal para Productos:
    Maneja el ciclo de vida completo de inventario con validaciones.
    """
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['codigo', 'nombre', 'descripcion']
    ordering_fields = ['precio', 'stock', 'creado_en']