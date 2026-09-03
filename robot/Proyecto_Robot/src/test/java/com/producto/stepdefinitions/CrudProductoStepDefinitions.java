package com.producto.stepdefinitions;

import com.producto.tasks.BuscarProducto;
import com.producto.tasks.CrearProducto;
import com.producto.tasks.EditarProducto;
import com.producto.tasks.EliminarProducto;
import com.producto.tasks.NavegarAlCatalogo;
import com.producto.questions.ElProductoEnGrilla;
import io.cucumber.java.es.Dado;
import io.cucumber.java.es.Cuando;
import io.cucumber.java.es.Entonces;
import net.serenitybdd.screenplay.actors.OnStage;
import net.serenitybdd.screenplay.actors.OnlineCast;
import io.cucumber.java.Before;
import static net.serenitybdd.screenplay.GivenWhenThen.seeThat;
import static org.hamcrest.Matchers.is;

public class CrudProductoStepDefinitions {

    @Before
    public void setTheStage() {
        OnStage.setTheStage(new OnlineCast());
    }

    @Dado("que {string} se encuentra en la pantalla del catálogo de productos")
    public void queElUsuarioSeEncuentraEnLaPantallaDelCatalogoDeProductos(String actorName) {
        OnStage.theActorCalled(actorName).wasAbleTo(
            NavegarAlCatalogo.ejecutar()
        );
    }

    @Cuando("el administrador crea un nuevo producto llamado {string} con precio {string}, sku {string}, stock {string} y descripcion {string}")
    public void elAdministradorCreaUnNuevoProducto(String nombre, String precio, String sku, String stock, String descripcion) {
        OnStage.theActorInTheSpotlight().attemptsTo(
            CrearProducto.conDatos(nombre, precio, sku, stock, descripcion)
        );
    }

    @Cuando("el administrador edita el precio del producto {string} a {string}")
    public void elAdministradorEditaElPrecio(String nombre, String nuevoPrecio) {
        OnStage.theActorInTheSpotlight().attemptsTo(
            EditarProducto.conPrecio(nombre, nuevoPrecio)
        );
    }

    @Cuando("el administrador elimina el producto {string}")
    public void elAdministradorEliminaElProducto(String nombre) {
        OnStage.theActorInTheSpotlight().attemptsTo(
            EliminarProducto.llamado(nombre)
        );
    }

    @Cuando("el administrador busca el producto {string} en la barra de búsqueda")
    public void elAdministradorBuscaElProducto(String termino) {
        OnStage.theActorInTheSpotlight().attemptsTo(
            BuscarProducto.conTermino(termino)
        );
    }

    @Entonces("el sistema deberia mostrar el producto {string} en la grilla")
    public void elSistemaDeberiaMostrarElProducto(String nombre) {
        OnStage.theActorInTheSpotlight().should(
            seeThat("El producto es visible", ElProductoEnGrilla.esVisible(nombre), is(true))
        );
    }

    @Entonces("el sistema ya no deberia mostrar el producto {string} en la grilla")
    public void elSistemaYaNoDeberiaMostrarElProducto(String nombre) {
        OnStage.theActorInTheSpotlight().should(
            seeThat("El producto es visible", ElProductoEnGrilla.esVisible(nombre), is(false))
        );
    }
}
