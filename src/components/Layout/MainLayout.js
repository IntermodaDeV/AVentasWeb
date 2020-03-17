import React from 'react';
import { useSnackbar } from "notistack";
import { Content, Footer, Header, Sidebar } from 'components/Layout';
import LoadingModal from 'components/Global/LoadingModal';

const MainLayout = (props) => {
  const { children } = props;
  const [online, setOnline] = React.useState(navigator.onLine);
  const [snack, setSnack] = React.useState(null);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();


  React.useEffect(() => {
    Online();
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return cleanupListener;
    // eslint-disable-next-line
  }, [])

  const cleanupListener = () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  }

  const handleOnline = () => {
    if (navigator.onLine) {
      setOnline(true);
      Online();
    }
  }
  const handleOffline = () => {
    if (!navigator.onLine) {
      setOnline(false);
      Online();
    }
  }

  const Online = () => {
    if (!online) {
      if (snack === null) {
        const key = enqueueSnackbar('Sin conexión!', {
          variant: 'error',
          anchorOrigin: {
            vertical: "bottom",
            horizontal: "right"
          },
          persist: true,
        });

        setSnack(key);
      }
    }
    else {
      if (snack !== null) {
        closeSnackbar(snack);
        setSnack(null);
      }
    }

  }

  return (
    <main className="cr-app bg-light">
      <LoadingModal/>
      <Sidebar />
      <Content fluid>
        <Header />
        {children}
        <Footer />
      </Content>
    </main>
  );
}

export default MainLayout;
