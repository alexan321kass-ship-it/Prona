package com.producto.tasks;

import com.producto.userinterfaces.CatalogoPage;
import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.actions.Click;
import net.serenitybdd.screenplay.actions.Enter;
import net.serenitybdd.screenplay.actions.SelectFromOptions;
import static net.serenitybdd.screenplay.Tasks.instrumented;

public class CrearProducto implements Task {
    private final String nombre;
    private final String precio;
    private final String sku;
    private final String stock;
    private final String descripcion;

    public CrearProducto(String nombre, String precio, String sku, String stock, String descripcion) {
        this.nombre = nombre;
        this.precio = precio;
        this.sku = sku;
        this.stock = stock;
        this.descripcion = descripcion;
    }

    @Override
    public <T extends Actor> void performAs(T actor) {
        actor.attemptsTo(
            Click.on(CatalogoPage.BTN_NUEVO_PRODUCTO),
            Enter.theValue(sku).into(CatalogoPage.INPUT_SKU),
            // Select category by index to avoid mapping specific text, index 1 is the first category usually.
            SelectFromOptions.byIndex(1).from(CatalogoPage.SELECT_CATEGORIA), 
            Enter.theValue(nombre).into(CatalogoPage.INPUT_NOMBRE),
            Enter.theValue(descripcion).into(CatalogoPage.INPUT_DESCRIPCION),
            Enter.theValue(precio).into(CatalogoPage.INPUT_PRECIO),
            Enter.theValue(stock).into(CatalogoPage.INPUT_STOCK),
            Click.on(CatalogoPage.BTN_GUARDAR)
        );
        try { Thread.sleep(1500); } catch (InterruptedException e) { e.printStackTrace(); }
    }

    public static CrearProducto conDatos(String nombre, String precio, String sku, String stock, String descripcion) {
        return instrumented(CrearProducto.class, nombre, precio, sku, stock, descripcion);
    }
}
