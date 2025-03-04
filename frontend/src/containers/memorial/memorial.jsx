import React, { useEffect, useState } from "react";
import styles from './styles.module.css';
import firstImage from '../../resources/4.jpg';
import secondImage from '../../resources/5.jpg';
import thirdImage from '../../resources/6.jpg';
import { useInView } from "react-intersection-observer";

const Memorial = () => {
    const [showScrollButton, setShowScrollButton] = useState(false);

    useEffect(() => {
        const handleWheel = (event) => {
            event.preventDefault();
            const container = event.currentTarget;
            const scrollAmount = event.deltaY;
            container.scrollBy({
                top: scrollAmount,
                behavior: 'smooth',
            });
        };

        const handleScroll = () => {
            if (window.scrollY > 200) {
                setShowScrollButton(true);
            } else {
                setShowScrollButton(false);
            }
        };

        const page = document.querySelector(`.${styles.page}`);
        page.addEventListener('wheel', handleWheel, { passive: false });
        window.addEventListener("scroll", handleScroll);

        return () => {
            page.removeEventListener('wheel', handleWheel);
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const [ref1, inView1] = useInView({ threshold: 0.7 });
    const [ref2, inView2] = useInView({ threshold: 0.7 });
    const [ref3, inView3] = useInView({ threshold: 0.7 });

    return (
        <div className={styles.page}>
            {/* Заголовок страницы */}
            <div className={styles.pageTitle}>
                <p className={styles.title}><b>Мемориал памяти Героям, павшим во время Великой Отечественной Войны.</b></p>
            </div>

            {/* Первый контейнер */}
            <div className={styles.container}>
                <img src={firstImage} alt="memorial" className={styles.image} />
                <div className={styles.textBlock}>
                    <p className={styles.name}>
                        <b>Владислав Хрустицкий</b>
                    </p>
                    <p className={styles.years}>
                        (1902-1944)
                    </p>
                    <div
                        ref={ref1}
                        className={`${styles.description} ${inView1 ? styles.descriptionVisible : styles.descriptionHidden}`}
                    >
                        <p>
                        Владислав Хрустицкий был призван в ряды Красной Армии еще в 20-е годы. В конце 30-х окончил бронетанковые курсы. С осени 1942-го командовал 61-й отдельной легкой танковой бригадой.
                        Погиб в бою под Волосово. В 1944 году враг отступал от Ленинграда, но время от времени предпринимал попытки контратаковать. Во время одной из таких контратак танковая бригада Хрустицкого угодила в ловушку. Несмотря на шквальный огонь, командир приказал продолжить наступление.
                        К сожалению, в этом бою храбрый танкист погиб. И все же поселок Волосово был освобожден от врага.
                        </p>
                    </div>
                </div>
            </div>

            {/* Второй контейнер */}
            <div className={styles.container}>
                <div className={styles.textBlock}>
                    <p className={styles.name}>
                        <b>Константин Заслонов</b>
                    </p>
                    <p className={styles.years}>
                        (1909-1942)
                    </p>
                    <div
                        ref={ref2}
                        className={`${styles.description} ${inView2 ? styles.descriptionVisible : styles.descriptionHidden}`}
                    >
                        <p>
                            В октябре 1941 года, когда немцы уже стояли под Москвой, сам вызвался на сложную операцию, в которой был необходим его железнодорожный опыт. Был заброшен в тыл противника. Там придумал так называемые «угольные мины».
                            Заслонов активно агитировал местное население переходить на сторону партизан. Фашисты, прознав это, переодели своих солдат в советскую форму. Заслонов принял их за перебежчиков и приказал пропустить в партизанский отряд. Путь коварному врагу был открыт. Завязался бой, в ходе которого Заслонов погиб.
                        </p>
                    </div>
                </div>
                <img src={secondImage} alt="memorial" className={styles.image} />
            </div>

            {/* Третий контейнер */}
            <div className={styles.container}>
                <img src={thirdImage} alt="memorial" className={styles.image} />
                <div className={styles.textBlock}>
                    <p className={styles.name}>
                        <b>Матвей Кузьмин</b>
                    </p>
                    <p className={styles.years}>
                        (1858-1942)
                    </p>
                    <div
                        ref={ref3}
                        className={`${styles.description} ${inView3 ? styles.descriptionVisible : styles.descriptionHidden}`}
                    >
                        <p>
                            Крестьянин Матвей Кузьмин появился на свет за три года до отмены крепостного права. А погиб, став самым пожилым обладателем звания Героя Советского Союза.
                            Его история содержит немало отсылок к истории другого известного крестьянина - Ивана Сусанина. Матвей тоже должен был вести захватчиков через лес и топи. И, как и легендарный герой, решил ценой своей жизни остановить врага. Он отправил вперед своего внука, чтобы тот предупредил отряд партизан, остановившийся неподалеку. Фашисты угодили в засаду. Завязался бой. Матвей Кузьмин погиб от руки немецкого офицера.
                            Но свое дело сделал. Ему шел 84-й год.
                        </p>
                    </div>
                </div>
            </div>

            {/* Кнопка "Наверх" */}
            {showScrollButton && (
                <button className={styles.scrollToTopButton} onClick={scrollToTop}>
                    ↑
                </button>
            )}
        </div>
    );
};

export default Memorial;