import React from 'react';
import Media from 'react-media';
import {APP_VERSION} from 'utils/Enviroment';


const Footer = () => {
  let year = new Date().getFullYear();
  return (
    <footer className="d-flex flex-grow-1 align-items-end page-footer font-small cyan darken-3">
      <div className="container">
        <div className="footer-copyright text-center py-3">
          <Media queries={{
            mobile: "(max-width: 767px)",
            desktop: "(min-width: 768px)"
          }}>
            {matches => (
              <>
                {
                  matches.mobile &&
                  <a className="text-decoration-none" href="https://www.intermoda.hn/">
                    © {year} INTERMODA SA DE CV - Version {APP_VERSION}
                    </a>
                }
                {
                  matches.desktop &&
                  <a className="text-decoration-none" href="https://www.intermoda.hn/">
                    © {year} INTERMODA SA DE CV - Version {APP_VERSION}
                    </a>
                }
              </>
            )}
          </Media>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
