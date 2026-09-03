package com.asesor.stepdefinitions;

import com.asesor.tasks.*;
import com.asesor.questions.ElClienteEnTabla;
import com.asesor.questions.ElMensajeDeExito;
import io.cucumber.java.Before;
import io.cucumber.java.es.Dado;
import io.cucumber.java.es.Cuando;
import io.cucumber.java.es.Entonces;
import net.serenitybdd.screenplay.actors.OnStage;
import net.serenitybdd.screenplay.actors.OnlineCast;
import static net.serenitybdd.screenplay.GivenWhenThen.seeThat;
import static org.hamcrest.Matchers.is;

public class AsesorStepDefinitions {

    @Before
    public void setTheStage() {
        OnStage.setTheStage(new OnlineCast());
    }

    // ─── NAVEGACIÓN ────────────────────────────────────────────────────────────

    @Dado("que {string} está en la página de gestión de clientes")
    public void queAsesorEstaEnClientes(String actorName) {
        OnStage.theActorCalled(actorName).wasAbleTo(
            NavegarComoAsesor.a("/clientes")
        );
    }

    @Dado("que {string} está en la página de pedidos")
    public void queAsesorEstaEnPedidos(String actorName) {
        OnStage.theActorCalled(actorName).wasAbleTo(
            NavegarComoAsesor.a("/Pedidos")
        );
    }

    // ─── CLIENTES CRUD ─────────────────────────────────────────────────────────

    @Cuando("el asesor crea un nuevo cliente llamado {string} con identificacion {string}, telefono {string}, correo {string} y direccion {string}")
    public void elAsesorCreaCliente(String nombre, String id, String tel, String correo, String dir) {
        OnStage.theActorInTheSpotlight().attemptsTo(
            CrearCliente.conDatos(nombre, id, tel, correo, dir)
        );
    }

    @Cuando("el asesor busca al cliente {string} en la barra de búsqueda")
    public void elAsesorBuscaCliente(String termino) {
        OnStage.theActorInTheSpotlight().attemptsTo(
            BuscarCliente.conTermino(termino)
        );
    }

    @Cuando("el asesor edita el teléfono del cliente {string} a {string}")
    public void elAsesorEditaCliente(String nombre, String nuevoTelefono) {
        OnStage.theActorInTheSpotlight().attemptsTo(
            EditarCliente.conTelefono(nombre, nuevoTelefono)
        );
    }

    @Cuando("el asesor elimina al cliente {string}")
    public void elAsesorEliminaCliente(String nombre) {
        OnStage.theActorInTheSpotlight().attemptsTo(
            EliminarCliente.llamado(nombre)
        );
    }

    // ─── PEDIDO ────────────────────────────────────────────────────────────────

    @Cuando("el asesor crea un pedido para el cliente {string} con el producto {string}")
    public void elAsesorCreaPedido(String cliente, String producto) {
        OnStage.theActorInTheSpotlight().attemptsTo(
            RealizarPedido.para(cliente, producto)
        );
    }

    // ─── COTIZACIÓN ────────────────────────────────────────────────────────────

    @Cuando("el asesor genera una cotización para el cliente {string} con el producto {string}")
    public void elAsesorGeneraCotizacion(String cliente, String producto) {
        OnStage.theActorInTheSpotlight().attemptsTo(
            GenerarCotizacion.para(cliente, producto)
        );
    }

    // ─── VALIDACIONES ──────────────────────────────────────────────────────────

    @Entonces("el sistema deberia mostrar al cliente {string} en la tabla")
    public void deberiaVerCliente(String nombre) {
        OnStage.theActorInTheSpotlight().should(
            seeThat("El cliente es visible en la tabla", ElClienteEnTabla.esVisible(nombre), is(true))
        );
    }

    @Entonces("el sistema ya no deberia mostrar al cliente {string} en la tabla")
    public void noDeberiaVerCliente(String nombre) {
        OnStage.theActorInTheSpotlight().should(
            seeThat("El cliente ya no es visible", ElClienteEnTabla.esVisible(nombre), is(false))
        );
    }

    @Entonces("el sistema deberia confirmar que el pedido fue creado")
    public void deberiaVerMensajeExitoPedido() {
        OnStage.theActorInTheSpotlight().should(
            seeThat("Mensaje de éxito del pedido", ElMensajeDeExito.estaVisible(), is(true))
        );
    }
}
