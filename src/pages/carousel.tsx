import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '~/components/ui/carousel'
import Carousel1 from '~/assets/carousel-1.jpg'
import Carousel2 from '~/assets/carousel-2.jpg'
import Carousel3 from '~/assets/carousel-3.jpg'
import Image, { StaticImageData } from 'next/image'
import AutoPlay from 'embla-carousel-autoplay'

const data: {
  image: StaticImageData
  description: string
}[] = [
    {
      image: Carousel1,
      description:
        '"Нүүдэлчин" Рубик Шооны Клубийг анх 2016 онд Н.Сэргэлэнбат багш дасгалжуулагч Дархан-Уул аймагт үүсгэн байгуулсан.',
    },
    {
      image: Carousel2,
      description:
        'Клубийн харьяа "Нүүдэлчин" багийг бэлтгэн "Азийн аварга шалгаруулах тэмцээн 2018" оос эхлэн тив дэлхийн тэмцээнүүдэд оролцож эхэлсэн',
    },
    {
      image: Carousel3,
      description: 'Бид рубик шоог эвлүүлэх хүсэл сонирхлоороо нэгдсэн баг юм.',
    },
  ]

export default function HomeCarousel() {
  return (
    <Carousel
      plugins={[
        AutoPlay({
          delay: 3000,
        }),
      ]}
      opts={{
        loop: true,
      }}
    >
      <CarouselContent>
        {data.map((item, index) => (
          <CarouselItem
            key={index}
            className="flex flex-col items-center gap-2"
          >
            <Image
              src={item.image}
              width={500}
              height={500}
              alt={`carousel-${index}`}
            />
            <p className="mx-auto w-3/4 text-center text-2xl">
              {item.description}
            </p>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  )
}
