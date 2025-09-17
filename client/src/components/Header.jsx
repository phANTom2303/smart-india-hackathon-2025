import {MdAccountBalance} from "react-icons/md";
import styles from "./Header.module.css";
//import { Link } from "react-router-dom";


function Header() {
    return (
        <div className={styles.header}>
         <div className= {styles.headerContent}>
            <div className={styles.leftSection}>
                <MdAccountBalance className = {styles.buildingIcon}/>
                <div className={styles.titleSection}>
                    <h1 className={styles.title}>Ongoing Data Capture</h1>
                </div>
            </div>
         </div>
         <div className={styles.rightSection}>
            <span className={styles.verifiedBadge}>
             🔒 Verified User   
            </span>
         </div>
        </div>
    );
}

export default Header;