import React,{useEffect, useState} from "react";
import "./App.css"
import{
    Rating,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button
} from "@mui/material";



function App(){
    const[filmes, setFilmes] = useState([]);
    const[tituloFiltro, setTituloFiltro] = useState("");
    const[ordenacao, setOrdenacao] = useState("");
    const[avaliacoes, setAvaliacoes] = useState({});
    const[filtrosExtras, setFiltrosExtras] = useState("todos");
    const[modalAberto, setModalAberto] = useState(false);
    const[filmeSelecionado, setFilmeSelecionado] = useState(null);
    const[notaTemporaria, setNotaTemporaria] = useState(0);
    const[comentarioTemporario, setComentarioTemporario] = useState("");
    const[incluirSinopse, setIncluirSinopse] = useState(false);

useEffect(() =>{
    fetch("https://ghibliapi.vercel.app/films")
    .then((res) => res.json())
    .then((dados) => setFilmes(dados));
},[]);

const handleAbrirModal = (filme) => {
    setFilmeSelecionado(filme);
    setNotaTemporaria(avaliacoes[filme.id]?.nota||0);
    setComentarioTemporario(avaliacoes[filme.id]?.comentario||"");
    setModalAberto(true);
}
const handleSalvarNota =() =>{
    setAvaliacoes({
        ...avaliacoes,
        [filmeSelecionado.id]:{
            ...avaliacoes[filmeSelecionado.id],
            nota: notaTemporaria,
            comentario: comentarioTemporario
        }
    });
    setModalAberto(false);
};

const toggleFavorito =(id)=>{
    setAvaliacoes((prev) =>({
        ...prev, [id]:{
            ...prev[id],
            favorito:!prev[id]?.favorito
        }
    }));
};

const toggleAssistido = (id) => {
    setAvaliacoes((prev) =>({
        [id]:{
            ...prev[id],
            assistido:!prev[id]?.assistido
        }
    }));
};

const mostrarFavoritos = () => setFiltrosExtras("favoritos");
const mostrarAssistidos = () => setFiltrosExtras("assistidos");
const mostrarAvaliados = () => setFiltrosExtras("notas");

const aplicarFiltros = 
filmes.filter((filme) => {
    const busca = tituloFiltro.toLowerCase();
    const porTitulo = filme.title.toLowerCase().includes(busca);
    const porSinopse = incluirSinopse && filme.description.toLowerCase().includes(busca);
    const avaliacao = avaliacoes[filme.id];

    if (filtrosExtras === "favoritos" && !avaliacao?.favorito) return false;
    if (filtrosExtras === "assistidos" && !avaliacao?.assistido) return false;
    if (filtrosExtras === "notas" && avaliacao?.nota == null) return false;

    return porTitulo||porSinopse;
});

const ordenarFilmes = (lista) =>{
    const novaLista = [...lista];
    switch(ordenacao){
        case "a-z":
            return novaLista.sort((a,b) => 
                a.title.localeCompare(b,title));
        case "z-a":
            return novaLista.sort((a,b) => 
                b.title.localeCompare(a,title));
        case "duracao-cresc":
            return novaLista.sort((a,b) => 
                a.running_time - b.running_time);
        case "duracao-decresc":
            return novaLista.sort((a,b) => 
                b.running_time - a.running_time);
        case "avaliacao-cresc":
            return novaLista.sort((a,b) =>
            (avaliacoes[a.id]?.nota||0)-(avaliacoes[b.id]?.nota||0));
        case "avaliacao-decresc":
            return novaLista.sort((a,b) =>
            (avaliacoes[b.id]?.nota||0)-(avaliacoes[a.id]?.nota||0));
        case "nota-rt":
            return novaLista.sort((a,b) =>
            b.rt_score - a.rt_score);
        case "nota-rt-menor":
            return novaLista.sort((a,b) =>
            a.rt_score - b.rt_score );

        default:
            return novaLista;

    }
};

const destacarTexto = (texto, termo) =>{
    if(!termo) return texto;
    const regex = new RegExp(`(${termo})` ,"gi");
    return texto.split(regex).map((parte,i) =>
    regex.test(parte)?<mark key={i}>{parte}</mark>:parte);
};

    return(
        <div className="App">
            <header className="topo">
                <h1>Catálogo Filmes Stugio Ghibli</h1>
                <h2>Encontre aqui todos os filmes do Studio Ghibli: os que voce viu, os que não viu,
                    descubra todos eles e alavie-os!
                </h2>
            </header>
            <div className="filtros-fixo">
                <input type="text"
                className="search-input"
                placeholder="Buscar por nome..."
                value={tituloFiltro}
                onChange={(e) =>
                    setTituloFiltro(e.target.value)}/>
                    <label>
                        <input type="checkbox"
                        checked={incluirSinopse}
                        onChange={(e) =>
                            setIncluirSinopse(e.target.checked)}/>
                            Incluir sinopse na busca
                    </label>
                    <div className="filtros-box"><select value={ordenacao}onChange={(e) =>
                    setOrdenacao(e.target.value)}>
                    <option value="">Ordenar por</option>
                    <option value="a-z">Titulo(A-Z)</option>
                    <option value="z-a">Titulo(Z-A)</option>
                    <option value="duracao-cresc">Duracao(Menor ⬅ Maior)</option>
                    <option value="duracao-decresc">Duração(Maior ⮕ Menor)</option>
                    <option value="avaliacao-cresc">Avaliação Pessoal(0-5)</option>
                    <option value="avaliacao-decresc">Avaliação Pessoal(5-0)</option>
                    <option value="nota-rt">Nota Ghibli(Maior)</option>
                    <option value="nota-rt-menor">Nota Ghibli(Menor)</option>
                    </select>
                    </div>
                    <div className="button-group">
                        <button onClick={mostrarFavoritos}> Favoritos</button>
                        <button onClick={mostrarAssistidos}> Assistidos</button>
                        <button onClick={mostrarAvaliados}> Avaliados</button>
                        <button onClick={() =>
                            setFiltrosExtras("todos")}>LimparFiltros</button>
                    </div>     
            </div>
            <section id="filmes">
                {ordenarFilmes(aplicarFiltros).map((filme) =>{
                    const avaliacao = avaliacoes[filme.id];
                    return(
                        <div key={filme.id}
                        className="filme">
                    <img src={filme.image}
                    alt={filme.title} />
                    <h3>{filme.title}</h3>
                    <p> <strong>Ano:</strong>
                    {filme.release_date}</p>
                    <p><strong>Duração:</strong>
                    {filme.running_time} min</p>
                    <p>{destacarTexto(filme.description,incluirSinopse?tituloFiltro: "")}</p>
                    <p><strong>Diretor:</strong>
                    {filme.director} |
                    <strong>Produtor</strong>{filme.producer}</p>
                    <p><strong>Nota Ghibli</strong>{filme.rt_score}</p>
                    {avaliacao?.nota!==undefined &&(<p><strong>Minha Avaliação</strong>
                    {avaliacao.nota}/5{avaliacao.comentario&&(<><br />
                    <em>"{avaliacao.comentario}"</em></>)}</p>)}
                    <div style={{marginTop:"10px"}}>
                     <Button onClick={() => toggleFavorito(filme.id)} variant="outlined" size="small">
                  {avaliacao?.favorito ? "★ Favorito" : "☆ Favorito"}
                </Button>
                <Button onClick={() => toggleAssistido(filme.id)} variant="outlined" size="small" style={{ marginLeft: 5 }}>
                  {avaliacao?.assistido ? "✔ Assistido" : "❌ Assistido"}
                </Button>
                <Button onClick={() => handleAbrirModal(filme)} variant="outlined" size="small" style={{ marginLeft: 5 }}>
                  Avaliar
                </Button>
                    </div>
                    </div>
                    );
                    })}
            </section>

                    <Dialog open={modalAberto} onClose={() => setModalAberto(false)}>
                    <DialogTitle>Avaliar:
                        {filmeSelecionado?.title}</DialogTitle>
                        <DialogContent>
                            <Rating name="nota" value={notaTemporaria}
                            onChange={(e,novaNota) => setNotaTemporaria(novaNota)} />
                            <textarea placeholder="Comentário(opcional)"
                            value={comentarioTemporario}
                            onChange={(e) => setComentarioTemporario(e.target.value)}
                            style={{width:"100%",marginTop:10}}/>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={() =>
                                    setModalAberto(false)}>Cancelar</Button>
                                    <Button onClick={handleSalvarNota}>Salvar</Button>
                            </DialogActions>
                    </Dialog>
        </div>
    );

}

export default App;