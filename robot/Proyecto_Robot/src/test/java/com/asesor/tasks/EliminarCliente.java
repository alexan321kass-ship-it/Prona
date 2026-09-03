package com.asesor.tasks;

import com.asesor.userinterfaces.ClientesPage;
import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.actions.Click;
import org.openqa.selenium.WebDriver;
import net.thucydides.core.webdriver.ThucydidesWebDriverSupport;
import static net.serenitybdd.screenplay.Tasks.instrumented;

public class EliminarCliente implements Task {
    private final String nombre;

    public EliminarCliente(String nombre) {
        this.nombre = nombre;
    }

    @Override
    public <T extends Actor> void performAs(T actor) {
        actor.attemptsTo(
            Click.on(ClientesPage.btnEliminarCliente(nombre))
        );
        try { Thread.sleep(500); } catch (InterruptedException e) { e.printStackTrace(); }
        WebDriver driver = ThucydidesWebDriverSupport.getDriver();
        driver.switchTo().alert().accept();
        try { Thread.sleep(1500); } catch (InterruptedException e) { e.printStackTrace(); }
    }

    public static EliminarCliente llamado(String nombre) {
        return instrumented(EliminarCliente.class, nombre);
    }
}
