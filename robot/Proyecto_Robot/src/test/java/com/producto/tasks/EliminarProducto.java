package com.producto.tasks;

import com.producto.userinterfaces.CatalogoPage;
import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.actions.Click;
import org.openqa.selenium.WebDriver;
import net.thucydides.core.webdriver.ThucydidesWebDriverSupport;
import static net.serenitybdd.screenplay.Tasks.instrumented;

public class EliminarProducto implements Task {
    private final String nombre;

    public EliminarProducto(String nombre) {
        this.nombre = nombre;
    }

    @Override
    public <T extends Actor> void performAs(T actor) {
        actor.attemptsTo(
            Click.on(CatalogoPage.btnEliminarProducto(nombre))
        );
        
        try { Thread.sleep(500); } catch (InterruptedException e) { e.printStackTrace(); }
        
        // Aceptar la alerta del navegador (confirm("¿Eliminar este producto?"))
        WebDriver driver = ThucydidesWebDriverSupport.getDriver();
        driver.switchTo().alert().accept();
        
        try { Thread.sleep(1500); } catch (InterruptedException e) { e.printStackTrace(); }
    }

    public static EliminarProducto llamado(String nombre) {
        return instrumented(EliminarProducto.class, nombre);
    }
}
