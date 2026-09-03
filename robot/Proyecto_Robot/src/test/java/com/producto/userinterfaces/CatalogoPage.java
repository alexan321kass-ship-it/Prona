package com.producto.userinterfaces;

import net.serenitybdd.screenplay.targets.Target;
import org.openqa.selenium.By;

public class CatalogoPage {
    public static final Target MENU_PRODUCTOS = Target.the("Menú de Productos")
            .located(By.xpath("//span[contains(text(),'Productos')]/ancestor::a | //a[contains(@href,'productos') | contains(@href,'Catalogo')]"));
    
    public static final Target BTN_NUEVO_PRODUCTO = Target.the("Botón Nuevo Producto")
            .located(By.cssSelector("button.btn-premium"));

    public static final Target BARRA_BUSQUEDA = Target.the("Barra de búsqueda del catálogo")
            .located(By.cssSelector("input.catalogo-buscador__input"));
    
    // Formulario Modal
    public static final Target INPUT_SKU = Target.the("Código SKU")
            .located(By.cssSelector("input[name='codigo_interno']"));
            
    public static final Target SELECT_CATEGORIA = Target.the("Categoría")
            .located(By.cssSelector("select[name='id_categoria']"));
            
    public static final Target INPUT_NOMBRE = Target.the("Nombre del Producto")
            .located(By.cssSelector("input[name='nombre_producto']"));
            
    public static final Target INPUT_DESCRIPCION = Target.the("Descripción")
            .located(By.cssSelector("textarea[name='descripcion']"));
            
    public static final Target INPUT_PRECIO = Target.the("Precio")
            .located(By.cssSelector("input[name='precio']"));
            
    public static final Target INPUT_STOCK = Target.the("Stock")
            .located(By.cssSelector("input[name='stock']"));
            
    public static final Target BTN_GUARDAR = Target.the("Botón Guardar")
            .located(By.cssSelector("form.premium-form button[type='submit']"));
            
    // Elementos dinámicos en la Grilla
    public static Target nombreProducto(String nombre) {
        return Target.the("Producto en la grilla llamado " + nombre)
                .located(By.xpath("//h4[contains(@class, 'product-name') and text()='" + nombre + "']"));
    }
    
    public static Target btnEditarProducto(String nombre) {
        return Target.the("Botón Editar Producto para " + nombre)
                .located(By.xpath("//h4[text()='" + nombre + "']/ancestor::div[contains(@class,'product-card-body')]//button[contains(@class,'edit')]"));
    }
    
    public static Target btnEliminarProducto(String nombre) {
        return Target.the("Botón Eliminar Producto para " + nombre)
                .located(By.xpath("//h4[text()='" + nombre + "']/ancestor::div[contains(@class,'product-card-body')]//button[contains(@class,'delete')]"));
    }
}
