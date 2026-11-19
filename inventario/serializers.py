from rest_framework import serializers
from .models import Categoria, Proveedor, Producto

# --- SERIALIZER DE CATEGORÍA ---
class CategoriaSerializer(serializers.ModelSerializer):
    """
    Convierte el modelo Categoria a formato JSON y valida datos entrantes.
    """
    class Meta:
        model = Categoria
        fields = '__all__'


# --- SERIALIZER DE PROVEEDOR ---
class ProveedorSerializer(serializers.ModelSerializer):
    """
    Convierte el modelo Proveedor a formato JSON y valida datos de contacto.
    """
    class Meta:
        model = Proveedor
        fields = '__all__'


# --- SERIALIZER DE PRODUCTO ---
class ProductoSerializer(serializers.ModelSerializer):
    """
    Convierte el modelo Producto a JSON. 
    Incluye campos de lectura para mostrar los nombres de la categoría y proveedor
    directamente en las tablas de React sin requerir peticiones adicionales.
    """
    categoria_nombre = serializers.ReadOnlyField(source='categoria.nombre')
    proveedor_nombre = serializers.ReadOnlyField(source='proveedor.nombre')

    class Meta:
        model = Producto
        fields = [
            'id', 
            'codigo', 
            'nombre', 
            'descripcion', 
            'precio', 
            'stock', 
            'categoria', 
            'categoria_nombre',
            'proveedor', 
            'proveedor_nombre',
            'creado_en'
        ]

    # Validación semántica: el precio no puede ser negativo ni cero
    def validate_precio(self, value):
        if value <= 0:
            raise serializers.ValidationError("El precio del producto debe ser mayor a 0.")
        return value

    # Validación semántica: el stock no puede ser negativo
    def validate_stock(self, value):
        if value < 0:
            raise serializers.ValidationError("El stock no puede ser un número negativo.")
        return value