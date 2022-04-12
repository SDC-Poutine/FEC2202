import React from 'react';
import axios from 'axios';
import Feed from './Feed.jsx';
import RatingsCharacteristics from './RatingsCharacteristics.jsx';
import PropTypes from 'prop-types';
import ReviewsCSS from '../cssModules/Reviews/Reviews.module.css';
import Characteristics from './Characteristics.jsx';

class Reviews extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      metaData: [],
      product_id: 0,
      reviewData: [],
      ratingAvg: 0,
      totalRatings: 0,
      wouldRecommend: 0,
      helpfulness: 0,
      reviewsArr: [],
      displayFilters: false,
      sortType: 'relevant',
      currentRatingFilter: 0
    };
    this.getMetaData = this.getMetaData.bind(this);
    this.getReviewInfo = this.getReviewInfo.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.viewFilters = this.viewFilters.bind(this);
    this.selectFilter = this.selectFilter.bind(this);
    this.changeRatingFilter = this.changeRatingFilter.bind(this);
  }

  componentDidMount() {
    this.setState({
      product_id: this.props.id,
    }, () => { this.getMetaData() })
    this.getReviewInfo();
    // this.getReviewsArr();
  }

  componentDidUpdate(prevProps, prevState) {
    // console.log(this.props.id, prevProps.id, this.state.product_id);
    if (this.props.id !== prevProps.id) {
      this.componentDidMount();
    }

    // console.log('current:',this.state.sortType, '\nprevious:',prevState.sortType);
    if (this.state.sortType !== prevState.sortType) {
      this.componentDidMount();
    }



  }
  // ?page=1&count=200&sort=newest&product_id=65633
  getReviewInfo() {
    axios.get(`reviews/?page=1&count=100000&sort=${this.state.sortType}&product_id=${this.props.id}`)
      .then((result) => {
        var temp = result.data;

        var tempHelpfulness = 0;
        var tempRatings = 0;
        var tempAvg = 0;
        var ratingCtr = 0;

        //to get tempRatings/TempAvg/TotalRatings
        for (let i = 0; i < temp.length; i++) {
          ratingCtr++;
          tempRatings += temp[i].rating;
        }
        tempAvg = tempRatings / ratingCtr;
        tempAvg = tempAvg.toFixed(1);

        //setting the % would recommend value to prop
        var wouldRecommend = 0;
        for (let i = 0; i < temp.length; i++) {
          if (temp[i].recommend === true) {
            wouldRecommend++;
          }
          tempHelpfulness += temp[i].helpfulness;
        }
        var recPct = 100 * (wouldRecommend / ratingCtr).toFixed(2);

        //getting the star reviews array
        var tempReviewsArr = [0, 0, 0, 0, 0];
        for (var i = 0; i < temp.length; i++) {
          tempReviewsArr[temp[i].rating - 1]++
        }
        // console.log(tempReviewsArr);

        //setting up initial render array
        var tempDisplayArr = [];
        var tempDisplay = 0
        if (tempReviewsArr.length === 1) {
          tempDisplayArr.push(temp[0]);
          tempDisplay = 1;
        } else {
          tempDisplayArr.push(temp[0], temp[1]);
          tempDisplay = 2;
        }
        // console.log(tempDisplay);
        this.setState({
          reviewData: temp,
          ratingAvg: tempAvg,
          totalRatings: ratingCtr,
          wouldRecommend: recPct,
          helpfulness: tempHelpfulness,
          reviewsArr: tempReviewsArr,
          displayArr: tempDisplayArr,
          currentlyDisplaying: tempDisplay
        })
      })
      .catch((err) => {
        console.log(err);
      });
  }

  //gets meta and sets the reviews array
  getMetaData() {
    axios.get(`reviews/meta?product_id=${this.state.product_id}`)
      .then((result) => {
        // console.log(result);
        var temp = [];
        temp.push(result.data);
        this.setState({
          metaData: temp
        })
      })
      .catch((err) => {
        console.log(err);
        // console.log('no success')
      })
  }

  viewFilters(e) {
    // console.log('in the viewFilter handler');
    var toggler = !this.state.displayFilters;
    // console.log(this.state.displayFilters, 'to', toggler);
    this.setState({displayFilters: toggler})
  }

  selectFilter(e) {
    console.log(e.target.value);

  }

  changeRatingFilter() {
    console.log('in the change filter in main component');
    this.setState({
      currentRatingFilter: 0,
      sortType: 'relevant'
    })
    this.getReviewInfo()
  }

  render() {
    let displayFilters;
    if (this.state.displayFilters === true) {
      displayFilters =
        <div className={ReviewsCSS.show} >
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); this.setState({ sortType: "helpful", displayFilters: false }) }}
          >Helpful</a>
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); this.setState({ sortType: "newest", displayFilters: false }) }}
          >Newest</a>
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); this.setState({ sortType: "relevant", displayFilters: false }) }}
          >Relevant</a>
      </div>
    }

    let loadingDiv;
    if (this.state.currentlyDisplaying === 0) {
      loadingDiv =
        <div>
          Reviews are loading...
        </div>
    } else if ((this.state.reviewData.length === 0 || this.state.metaData.length === 0) ) {
      loadingDiv =
        <Feed
          reviewData={this.state.reviewData}
          totalRatings={this.state.totalRatings}
        />
    } else {
      loadingDiv =
      <div className={ReviewsCSS.RC_FeedContainer}>
      {/*This div will hold
      the css for the feed
      and star ratings, idealy
      split into a 2:1*/}
        <div >
          <div className={ReviewsCSS.RC_Feed_Flex1}>
            <RatingsCharacteristics
              ratingAvg={Number(this.state.ratingAvg)}
              wouldRecommend={this.state.wouldRecommend}
              reviewsArr={this.state.reviewsArr}
              totalRatings={this.state.totalRatings}
              changeRatingFilter={this.changeRatingFilter}
              />
              <p><strong className={ReviewsCSS.characteristicHeader}>About the product:</strong></p>
            <div className={ReviewsCSS.characteristicsContainer}>
              <Characteristics chars={this.state.metaData[0]}/>
            </div>
            </div>

        </div>


         <div className={ReviewsCSS.RC_Feed_Flex2}>
          <div className={ReviewsCSS.dropDownFlex}>
            <span>
              <strong>
                {this.state.totalRatings} reviews, sorted by
              </strong>
              <button
                onClick={this.viewFilters}
                className={ReviewsCSS.dropbtn}>{this.state.sortType} &#8595;
              </button>
              <button
                className={ReviewsCSS.resetbtn}
                onClick={() => { this.setState({ sortType: 'relevant', }) }}
                type="button"
              >Reset
              </button>
            </span>
            <div
              className={ReviewsCSS.dropdownContent}
            >
              {displayFilters}
            </div>
          </div>
          <Feed
            reviewData={this.state.reviewData}
            totalRatings={this.state.totalRatings}
            id={this.props.id}
          />
        </div>
      </div>
    }
    return (
      <div className='scroll-target'>
        {loadingDiv}
      </div>
    )
  }
}

Reviews.propTypes = {
  id: PropTypes.number
}

export default Reviews;

// // //65631, 65632, 65633,65634, 65635