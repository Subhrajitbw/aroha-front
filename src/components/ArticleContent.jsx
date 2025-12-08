import { memo } from "react";
import PropTypes from "prop-types";

const ArticleContent = memo(({ className = "" }) => {
  return (
    <div
      className={`self-stretch flex flex-row items-start justify-center py-0 px-5 box-border max-w-full text-left text-9xl text-background-primary font-nav-item ${className}`}
    >
      <div className="w-[1200px] flex flex-col items-start justify-start gap-16 max-w-full gap-4 gap-8">
        <div className="self-stretch flex flex-row items-start justify-center py-0 px-5 box-border max-w-full text-5xl">
          <h3 className="m-0 w-[800px] relative text-inherit leading-[170%] font-normal font-inherit inline-block shrink-0 max-w-full mq450:text-lgi mq450:leading-[33px]">
            Mauris cursus mattis molestie a iaculis at erat pellentesque
            adipiscing. Netus et malesuada fames ac turpis egestas integer eget.
            A diam maecenas sed enim ut sem viverra aliquet eget. Vel fringilla
            est ullamcorper eget nulla facilisi etiam. Velit egestas dui id
            ornare arcu odio ut. Felis donec et odio pellentesque diam volutpat
            commodo sed egestas.
          </h3>
        </div>
        <div className="self-stretch flex flex-row items-start justify-center py-0 px-5 box-border max-w-full text-lg">
          <div className="h-[580px] w-[800px] relative leading-[160%] inline-block shrink-0 max-w-full">
            <p className="m-0">{`Turpis egestas integer eget aliquet nibh praesent tristique. Et malesuada fames ac turpis. Etiam dignissim diam quis enim lobortis scelerisque fermentum dui faucibus. Dictum fusce ut placerat orci nulla pellentesque dignissim. Lectus magna fringilla urna porttitor rhoncus dolor purus non enim. Purus in massa tempor nec feugiat. `}</p>
            <p className="m-0">&nbsp;</p>
            <p className="m-0">
              Nec feugiat in fermentum posuere. Lacus viverra vitae congue eu
              consequat ac. Tellus molestie nunc non blandit massa. Pharetra
              pharetra massa massa ultricies mi quis. Nisi vitae suscipit tellus
              mauris a diam maecenas sed enim. Congue nisi vitae suscipit tellus
              mauris a. Mauris augue neque gravida in fermentum et sollicitudin
              ac orci.
            </p>
            <p className="m-0">&nbsp;</p>
            <p className="m-0">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Turpis
              massa sed elementum tempus egestas sed sed risus. Elit eget
              gravida cum sociis. Scelerisque eu ultrices vitae auctor eu augue
              ut lectus arcu. Vulputate eu scelerisque felis imperdiet proin.
              Lobortis elementum nibh tellus molestie. Eget aliquet nibh
              praesent tristique magna sit amet purus. Risus nullam eget felis
              eget nunc lobortis. Dolor sit amet consectetur adipiscing elit
              duis. Eros in cursus turpis massa tincidunt dui ut ornare. Morbi
              tristique senectus et netus et. Urna duis convallis convallis
              tellus id. Magna sit amet purus gravida quis blandit turpis
              cursus. Eu scelerisque felis imperdiet proin fermentum leo. Sed id
              semper risus in hendrerit gravida rutrum. Integer quis auctor elit
              sed vulputate mi. Aliquam etiam erat velit scelerisque in dictum
              non consectetur. Sagittis aliquam malesuada bibendum arcu vitae.
            </p>
          </div>
        </div>
        <div className="self-stretch flex flex-row items-start justify-center py-0 px-5 box-border max-w-full">
          <div className="w-[800px] flex flex-col items-start justify-start gap-6 max-w-full">
            <h2 className="m-0 relative text-inherit uppercase font-medium font-inherit mq450:text-3xl">
              Lorem Ipsum
            </h2>
            <div className="self-stretch relative text-lg leading-[160%]">
              <p className="m-0">{`Turpis egestas integer eget aliquet nibh praesent tristique. Et malesuada fames ac turpis. Etiam dignissim diam quis enim lobortis scelerisque fermentum dui faucibus. Dictum fusce ut placerat orci nulla pellentesque dignissim. Lectus magna fringilla urna porttitor rhoncus dolor purus non enim. Purus in massa tempor nec feugiat. `}</p>
              <p className="m-0">&nbsp;</p>
              <p className="m-0">
                Nec feugiat in fermentum posuere. Lacus viverra vitae congue eu
                consequat ac. Tellus molestie nunc non blandit massa. Pharetra
                pharetra massa massa ultricies mi quis. Nisi vitae suscipit
                tellus mauris a diam maecenas sed enim. Congue nisi vitae
                suscipit tellus mauris a. Mauris augue neque gravida in
                fermentum et sollicitudin ac orci.
              </p>
            </div>
          </div>
        </div>
        <div className="self-stretch flex flex-col items-start justify-start gap-4 text-center text-77xl font-heading-large">
          <div className="self-stretch h-16 flex flex-row items-start justify-center py-0 px-5 box-border">
            <div className="self-stretch w-px relative bg-background-primary" />
          </div>
          <h1 className="m-0 self-stretch relative text-inherit leading-[110%] font-normal font-inherit mq450:text-10xl mq450:leading-[42px] mq800:text-29xl mq800:leading-[63px]">
            <p className="m-0">{`Have no fear of perfection `}</p>
            <p className="m-0">- you’ll never reach it.</p>
          </h1>
          <div className="self-stretch flex flex-row items-start justify-center py-0 pl-5 pr-[22px] text-left text-base font-nav-item">
            <div className="relative tracking-[1px] uppercase font-medium inline-block min-w-[127px]">
              Salvador Dali
            </div>
          </div>
          <div className="self-stretch h-16 flex flex-row items-start justify-center py-0 px-5 box-border">
            <div className="self-stretch w-px relative bg-background-primary" />
          </div>
        </div>
        <div className="self-stretch flex flex-row items-start justify-center py-0 px-5 box-border max-w-full">
          <div className="w-[800px] flex flex-col items-start justify-start gap-6 max-w-full">
            <h2 className="m-0 relative text-inherit uppercase font-medium font-inherit mq450:text-3xl">
              Lorem Ipsum
            </h2>
            <div className="self-stretch relative text-lg leading-[160%]">
              <p className="m-0">{`Turpis egestas integer eget aliquet nibh praesent tristique. Et malesuada fames ac turpis. Etiam dignissim diam quis enim lobortis scelerisque fermentum dui faucibus. Dictum fusce ut placerat orci nulla pellentesque dignissim. Lectus magna fringilla urna porttitor rhoncus dolor purus non enim. Purus in massa tempor nec feugiat. `}</p>
              <p className="m-0">&nbsp;</p>
              <p className="m-0">
                Nec feugiat in fermentum posuere. Lacus viverra vitae congue eu
                consequat ac. Tellus molestie nunc non blandit massa. Pharetra
                pharetra massa massa ultricies mi quis. Nisi vitae suscipit
                tellus mauris a diam maecenas sed enim. Congue nisi vitae
                suscipit tellus mauris a. Mauris augue neque gravida in
                fermentum et sollicitudin ac orci.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

ArticleContent.propTypes = {
  className: PropTypes.string,
};

export default ArticleContent;
