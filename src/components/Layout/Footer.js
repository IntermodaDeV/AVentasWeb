import React from 'react';
import Media from 'react-media';


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
                  <a className="text-decoration-none" href="https://cit.hn">
                    © {year} CIT
                    </a>
                }
                {
                  matches.desktop &&
                  <a className="text-decoration-none" href="https://cit.hn">
                    © {year} Creative Information Technologies
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
