from django.db import models

# --- MODELO 1: CATEGORÍA ---
class Categoria(models.Model):
    """
    Entidad que agrupa los productos por tipo o familia comercial.
    Relación 1:N con Producto.
    """
    nombre = models.CharField(max_length=100, unique=True, verbose_name="Nombre de Categoría")
    descripcion = models.TextField(blank=True, null=True, verbose_name="Descripción")
    activo = models.BooleanField(default=True, verbose_name="¿Activo?")
    creado_en = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de Creación")

    class Meta:
        verbose_name = "Categoría"
        verbose_name_plural = "Categorías"
        ordering = ['nombre']

    def __str__(self):
        return self.nombre


# --- MODELO 2: PROVEEDOR ---
class Proveedor(models.Model):
    """
    Entidad que representa a la empresa o distribuidor que suministra artículos.
    Relación 1:N con Producto.
    """
    nombre = models.CharField(max_length=150, verbose_name="Nombre o Razón Social")
    contacto = models.CharField(max_length=100, verbose_name="Persona de Contacto")
    telefono = models.CharField(max_length=20, verbose_name="Teléfono")
    email = models.EmailField(verbose_name="Correo Electrónico")
    creado_en = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de Registro")

    class Meta:
        verbose_name = "Proveedor"
        verbose_name_plural = "Proveedores"
        ordering = ['nombre']

    def __str__(self):
        return self.nombre


# --- MODELO 3: PRODUCTO ---
class Producto(models.Model):
    """
    Entidad principal de inventario. Posee llaves foráneas hacia Categoria y Proveedor,
    asegurando la integridad referencial requerida por la pauta.
    """
    codigo = models.CharField(max_length=50, unique=True, verbose_name="Código SKU")
    nombre = models.CharField(max_length=200, verbose_name="Nombre del Producto")
    descripcion = models.TextField(blank=True, null=True, verbose_name="Descripción")
    precio = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Precio Unitario")
    stock = models.PositiveIntegerField(default=0, verbose_name="Stock Disponible")

    # Relación 1:N con Categoría (si se elimina una categoría, se protegen o eliminan en cascada sus productos)
    categoria = models.ForeignKey(
        Categoria, 
        on_delete=models.CASCADE, 
        related_name='productos',
        verbose_name="Categoría"
    )

    # Relación 1:N con Proveedor
    proveedor = models.ForeignKey(
        Proveedor, 
        on_delete=models.CASCADE, 
        related_name='productos',
        verbose_name="Proveedor"
    )

    creado_en = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de Ingreso")

    class Meta:
        verbose_name = "Producto"
        verbose_name_plural = "Productos"
        ordering = ['-creado_en']

    def __str__(self):
        return f"{self.codigo} - {self.nombre}"