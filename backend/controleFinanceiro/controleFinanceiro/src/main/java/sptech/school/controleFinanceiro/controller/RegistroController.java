package sptech.school.controleFinanceiro.controller;

import sptech.school.controleFinanceiro.model.Registro;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/registros")
@CrossOrigin(origins = "*")
public class RegistroController {

    private final JdbcTemplate jdbcTemplate;

    public RegistroController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<Registro> rowMapper = (rs, rowNum) -> {
        Registro r = new Registro();
        r.setId(rs.getLong("id"));
        r.setValor(rs.getDouble("valor"));
        r.setDescricao(rs.getString("descricao"));
        r.setCategoria(rs.getString("categoria"));

        if (rs.getDate("data_registro") != null) {
            r.setDataRegistro(rs.getDate("data_registro").toLocalDate());
        }

        r.setTipo(rs.getString("tipo"));
        r.setPago(rs.getBoolean("pago"));

        return r;
    };

    @GetMapping("/categorias")
    public List<String> getCategorias() {
        return Arrays.asList("Comida", "Lazer", "Investimento", "Estudos", "Saúde", "Outros");
    }

    @GetMapping
    public ResponseEntity<List<Registro>> listar() {
        List<Registro> lista = jdbcTemplate.query("SELECT * FROM registro", rowMapper);

        return ResponseEntity.status(200).body(lista);
    }

    @PostMapping
    public ResponseEntity<Void> criar(@RequestBody Registro registro) {

        if (registro.getValor() == null || registro.getValor() <= 0 ||
                registro.getDescricao() == null || registro.getDescricao().trim().isEmpty() ||
                registro.getCategoria() == null || registro.getCategoria().trim().isEmpty() ||
                registro.getDataRegistro() == null ||
                registro.getTipo() == null || registro.getTipo().trim().isEmpty()) {

            return ResponseEntity.status(400).build();
        }

        Boolean pago = registro.getPago();

        if (pago == null) {
            pago = false;
        }

        String sql = "INSERT INTO registro (valor, descricao, categoria, data_registro, tipo, pago) VALUES (?, ?, ?, ?, ?, ?)";

        jdbcTemplate.update(
                sql,
                registro.getValor(),
                registro.getDescricao(),
                registro.getCategoria(),
                registro.getDataRegistro(),
                registro.getTipo(),
                pago
        );

        return ResponseEntity.status(201).build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> atualizar(@PathVariable Long id, @RequestBody Registro registro) {

        if (registro.getValor() == null || registro.getValor() <= 0 ||
                registro.getDescricao() == null || registro.getDescricao().trim().isEmpty() ||
                registro.getCategoria() == null || registro.getCategoria().trim().isEmpty() ||
                registro.getDataRegistro() == null ||
                registro.getTipo() == null || registro.getTipo().trim().isEmpty()) {

            return ResponseEntity.status(400).build();
        }

        Boolean pago = registro.getPago();

        if (pago == null) {
            pago = false;
        }

        String sql = "UPDATE registro SET valor = ?, descricao = ?, categoria = ?, data_registro = ?, tipo = ?, pago = ? WHERE id = ?";

        int linhasAfetadas = jdbcTemplate.update(
                sql,
                registro.getValor(),
                registro.getDescricao(),
                registro.getCategoria(),
                registro.getDataRegistro(),
                registro.getTipo(),
                pago,
                id
        );

        if (linhasAfetadas == 0) {
            return ResponseEntity.status(404).build();
        }

        return ResponseEntity.status(200).build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        String sql = "DELETE FROM registro WHERE id = ?";

        int linhasAfetadas = jdbcTemplate.update(sql, id);

        if (linhasAfetadas == 0) {
            return ResponseEntity.status(404).build();
        }

        return ResponseEntity.status(204).build();
    }
}