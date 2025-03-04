import React, { useEffect, useState } from "react";
import styles from './styles.module.css';
import firstImage from '../../resources/1.jpeg';
import secondImage from '../../resources/2.jpeg';
import thirdImage from '../../resources/3.jpeg';
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
                <p className={styles.title}><b>Мемориал памяти лётчикам Героям времён Великой Отечественной Войны.</b></p>
            </div>

            {/* Первый контейнер */}
            <div className={styles.container}>
                <img src={firstImage} alt="memorial" className={styles.image} />
                <div className={styles.textBlock}>
                    <p className={styles.name}>
                        <b>Гулаев Николай Дмитриевич</b>
                    </p>
                    <p className={styles.years}>
                        (26.02.1918 – 27.09.1985)
                    </p>
                    <div
                        ref={ref1}
                        className={`${styles.description} ${inView1 ? styles.descriptionVisible : styles.descriptionHidden}`}
                    >
                        <p>
                            Участник Великой Отечественной войны, летчик-истребитель, генерал-полковник авиации. Дважды Герой Советского Союза.
                            Всего за время войны совершил 250 боевых вылетов. В 49 воздушных боях лично сбил 55 самолетов противника и 5 – в группе.
                        </p>
                    </div>
                </div>
            </div>

            {/* Второй контейнер */}
            <div className={styles.container}>
                <div className={styles.textBlock}>
                    <p className={styles.name}>
                        <b>Речкалов Григорий Андреевич</b>
                    </p>
                    <p className={styles.years}>
                        (09.02.1918 (или 1920) – 20.12.1990)
                    </p>
                    <div
                        ref={ref2}
                        className={`${styles.description} ${inView2 ? styles.descriptionVisible : styles.descriptionHidden}`}
                    >
                        <p>
                            Участник Великой Отечественной войны, летчик-ас, генерал-майор авиации, дважды Герой Советского Союза.
                            Всего за время войны Речкаловым было совершено 450 боевых вылетов, 122 воздушных боя. Сбил 56 самолетов лично и 4 – в группе.
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
                        <b>Головачёв Павел Яковлевич</b>
                    </p>
                    <p className={styles.years}>
                        (15.12.1917 – 02.07.1972)
                    </p>
                    <div
                        ref={ref3}
                        className={`${styles.description} ${inView3 ? styles.descriptionVisible : styles.descriptionHidden}`}
                    >
                        <p>
                            Участник Великой Отечественной войны, летчик-ас, генерал-майор авиации, дважды Герой Советского Союза.
                            За время войны совершил 457 боевых вылетов, в 125 воздушных боях сбил лично 31 и в группе – 1 самолет противника. Свою последнюю победу одержал 25 апреля 1945 года в небе над Берлином.
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