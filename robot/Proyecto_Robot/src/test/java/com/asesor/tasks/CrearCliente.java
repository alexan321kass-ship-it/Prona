package com.asesor.tasks;

import com.asesor.userinterfaces.ClientesPage;
import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.actions.Click;
import net.serenitybdd.screenplay.actions.Enter;
import static net.serenitybdd.screenplay.Tasks.instrumented;

public class CrearCliente implements Task {
    private final String nombre;
    private final String identificacion;
    private final String telefono;
    private final String correo;
    private final String direccion;

    public CrearCliente(String nombre, String identificacion, String telefono, String correo, String direccion) {
        this.nombre = nombre;
        this.identificacion = identificacion;
        this.telefono = telefono;
        this.correo = correo;
        this.direccion = direccion;
    }

    @Override
    public <T extends Actor> void performAs(T actor) {
        actor.attemptsTo(
            Click.on(ClientesPage.BTN_NUEVO_CLIENTE),
            Enter.theValue(nombre).into(ClientesPage.INPUT_NOMBRE),
            Enter.theValue(identificacion).into(ClientesPage.INPUT_IDENTIFICACION),
            Enter.theValue(telefono).into(ClientesPage.INPUT_TELEFONO),
            Enter.theValue(correo).into(ClientesPage.INPUT_CORREO),
            Enter.theValue(direccion).into(ClientesPage.INPUT_DIRECCION),
            Click.on(ClientesPage.BTN_GUARDAR)
        );
        try { Thread.sleep(1500); } catch (InterruptedException e) { e.printStackTrace(); }
    }

    public static CrearCliente conDatos(String nombre, String identificacion, String telefono, String correo, String direccion) {
        return instrumented(CrearCliente.class, nombre, identificacion, telefono, correo, direccion);
    }
}
