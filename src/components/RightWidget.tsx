import type{PropsWithChildren}from'react';import styles from'./RightWidget.module.css'
export function RightWidget({title,code,className='',children}:PropsWithChildren<{title:string;code:string;className?:string}>){return <section className={`${styles.widget} ${className}`}><header><h2>{title}</h2><span>{code}</span></header>{children}</section>}
