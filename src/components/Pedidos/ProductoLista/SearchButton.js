import React, { useState } from 'react';
import styles from 'components/Pedidos/ProductoLista/SearchButton.module.css';
import { FaSearch } from "react-icons/fa";


const SearchButton = (props) => {
    const [SearchText, setSearchText] = useState("");

    React.useEffect(() => {
        props.clear();
        // eslint-disable-next-line
    }, []);

    const handleSubmit = event => {
        event.preventDefault();
        if (SearchText.length === 0 || !SearchText.trim()) {
            props.clear();
        }
        else {
            props.onSearch(SearchText);
        }
    };

    const SearchChange = (event) => {
        setSearchText(event.target.value);

        if (event.target.value.length === 0 || !event.target.value.trim()) {
            props.clear();
        }
        else {
            props.onSearch(event.target.value);
        }
    }

    return (
        <form onSubmit={handleSubmit} className={styles.wrap} >
            {props.backgroundColor ?
                <input className={styles.inputSearch} onChange={SearchChange.bind(this)} style={{ backgroundColor: props.backgroundColor }} placeholder="Buscar" />
                :
                <input className={styles.inputSearch + " " + styles.WithBackground} onChange={SearchChange.bind(this)} placeholder="Buscar" />
            }

            <div className={styles.inputSearchSubmit} > <FaSearch className={styles.iconSearch} /></div>
        </form>
    )

    // return (
    //     <form onSubmit={handleSubmit} class={Class}>
    //         <input type="search" class={styles.searchBox} onChange={SearchChange.bind(this)} />
    //         <span class={styles.searchButton}  onClick={() => expand()}>
    //             <span class={styles.searchIcon} ></span>
    //         </span>
    //     </form>
    // )
}

export default SearchButton;